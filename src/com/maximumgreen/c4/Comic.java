package com.maximumgreen.c4;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Comic {
	//Unique Generated Id
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@PrimaryKey
	private Long id;
	
	//ID of series
	@Persistent
	private Long seriesId;
	
	//List of tags the author has added to the comic
	@Persistent
	private List<Tag> tags;
	
	//List of PAGE Id within this comic. Series -> Comics -> Pages
	@Persistent 
	private List<Long> pages;
	
	//Date the COMIC was created
	@Persistent 
	private Date dateCreated;
	
	//List of COMMENT IDs for the specific comic
	@Persistent
	private List<Long> comments;
	
	//Map of User keys and Integer rating given to this comic by specific user
	@Persistent
	private Map<String, Integer> ratings;
	
	//Empty constructor
	public Comic(){
	}

	//Getters and setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getSeriesId() {
		return seriesId;
	}

	public void setSeriesId(Long seriesId) {
		this.seriesId = seriesId;
	}

	public List<Tag> getTags() {
		return tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}

	public List<Long> getPages() {
		return pages;
	}

	public void setPages(List<Long> pages) {
		this.pages = pages;
	}

	public Date getDateCreated() {
		return dateCreated;
	}

	public void setDateCreated(Date dateCreated) {
		this.dateCreated = dateCreated;
	}

	public List<Long> getComments() {
		return comments;
	}

	public void setComments(List<Long> comments) {
		this.comments = comments;
	}

	public Map<String, Integer> getRatings() {
		return ratings;
	}

	public void setRatings(Map<String, Integer> ratings) {
		this.ratings = ratings;
	}
	
}
