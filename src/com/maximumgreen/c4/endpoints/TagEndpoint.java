package com.maximumgreen.c4.endpoints;

import com.maximumgreen.c4.PMF;
import com.maximumgreen.c4.Tag;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.NotFoundException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "tagendpoint", namespace = @ApiNamespace(ownerDomain = "maximumgreen.com", ownerName = "maximumgreen.com", packagePath = "c4"))
public class TagEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listTag")
	public CollectionResponse<Tag> listTag(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Tag> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Tag.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Tag>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Tag obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Tag> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getTag")
	public Tag getTag(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Tag tag = null;
		try {
			tag = mgr.getObjectById(Tag.class, id);
		} finally {
			mgr.close();
		}
		return tag;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param tag the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertTag")
	public Tag insertTag(Tag tag) throws BadRequestException {
		if (tag.getName() == null)
			throw new BadRequestException("Title or Author missing.");
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (tag.getId() != null) {
				if (containsTag(tag)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			mgr.makePersistent(tag);
		} finally {
			mgr.close();
		}
		return tag;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param tag the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateTag")
	public Tag updateTag(Tag tag) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTag(tag)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(tag);
		} finally {
			mgr.close();
		}
		return tag;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeTag")
	public void removeTag(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Tag tag = mgr.getObjectById(Tag.class, id);
			mgr.deletePersistent(tag);
		} finally {
			mgr.close();
		}
	}

	@ApiMethod(name="addtaggedcomic")
	public Tag addTaggedComic(@Named("tagId") Long tagId, @Named("comicId") Long comicId)
			throws BadRequestException, NotFoundException{
		PersistenceManager mgr = getPersistenceManager();
		
		Tag tag;
		
		try {
			tag = mgr.getObjectById(Tag.class, tagId);
			
			if (tag.getComicsWithTag() == null){
				List<Long> list = new ArrayList<Long>();
				tag.setComicsWithTag(list);
			}
			
			tag.addTaggedComic(comicId);
			
			mgr.makePersistent(tag);
			
		} catch (javax.jdo.JDOObjectNotFoundException ex){
			throw new NotFoundException("Tag Id invalid.");
		} finally {
			mgr.close();
		}
		
		return tag;
	}
	
	@ApiMethod(name="deletetaggedcomment")
	public Tag deleteTaggedComic(@Named("tagId") Long tagId, @Named("comicId") Long comicId)
			throws BadRequestException, NotFoundException{
		PersistenceManager mgr = getPersistenceManager();
		
		Tag tag;
		
		try {
			tag = mgr.getObjectById(Tag.class, tagId);
			tag.deleteTaggedComic(comicId);
			
			mgr.makePersistent(tag);
			
		} catch (javax.jdo.JDOObjectNotFoundException ex){
			throw new NotFoundException("Tag Id invalid.");
		} finally {
			mgr.close();
		}
		
		return tag;
	}
	
	private boolean containsTag(Tag tag) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Tag.class, tag.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
