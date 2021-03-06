"use strict";

(function() {

angular.module('c4').controller('comicCtrl', ['$scope', '$http', 'GApi', '$state', '$stateParams', 'imgService', 'IMG_PREFIXES', "GAuth" , "GData", '$cookies',
									function(    $scope,   $http,   GApi,   $state,   $stateParams,   imgService,   IMG_PREFIXES, GAuth, GData, $cookies){

	/* README
	 * All comments are in the $scope.comments variable. The 4 fields are username(username...duh),
	 * comment(actual comment), profileImageURL(the url to profile image), dateString(string for date and time)
	 * The "Add" button adds comment. The cross next to your own comment deletes it

	 * The "commment icon" is binded to show/hide comment box, use method toggleCommets()/closeComments
	 *
	 */
	var id;
	if($stateParams.id){
		id = $stateParams.id;
	} else{
		$state.go('error');
	}

	$scope.comic_id = $stateParams.id;
	$scope.pages = [];
	$scope.comic = {};
	$scope.comments = [];
	$scope.comment_ids = [];
	$scope.show_comment = false;
	$scope.is_owner = false;
	//THIS MUST BE AN OBJECT. according to angular api, best practice with
	//ng-model is using "."
	$scope.comment_obj = {comment: ""};
	$scope.logged_in = false;
	$scope.faved = false;
	//check auth
	GAuth.checkAuth().then(
		function(){
			$scope.logged_in = true;
			$scope.user_id = GData.getUser().id;
		},
		function(){}
	);

	//functions
	//COMMENT FUNCTIONS
	$scope.add_comment = function(){
		//console.log("add reached UserId: " + $scope.user_id + " comicId: " + $scope.comic_id + " comment: " + $scope.comment_obj.comment);
		GApi.execute("comicendpoint",'addComicComment', {"userId": $scope.user_id, "comicId":$scope.comic_id, "comment":$scope.comment_obj.comment}).then(
			function(resp){
				$scope.comment_obj.comment = "";
				$scope.getComic();
			},
			function(resp){
				console.log("Failed to add comment");
			}
		);
	}

	$scope.delete_comment = function(delete_id){
		//console.log("del reached UserId: " + $scope.user_id + " comicId: " + $scope.comic_id + " commentId: " + delete_id);
		GApi.execute("comicendpoint", "deleteComicComment", {"userId": $scope.user_id, "comicId": $scope.comic_id, "commentId":delete_id}).then(
			function(resp){
				$scope.getComic();
			},
			function(resp){
				console.log("Failed to delete comment");
			}
		);
	}

	//DONOT USE THIS TO UPDATE COMMENTS, use getComic() ...get/update the comments
	$scope.update_comments = function(){
		$scope.comments = [];
		if($scope.comment_ids != null){
			//query for each comment
			for(var i = 0; i < $scope.comment_ids.length; i ++){
				GApi.execute("commentendpoint", "getComment", {"id":$scope.comment_ids[i]}).then(
					function(commentResp){
						//query for the author
						//console.log(commentResp.userId);
						GApi.execute("c4userendpoint","getC4User", {"id":commentResp.userId}).then(
							function(userResp){
								$scope.comments.push({
									id: commentResp.id,
									user_id: commentResp.userId,
									comment:commentResp.comment,
									username:userResp.username,
									dateString:commentResp.dateString,
									profileImageURL: userResp.profileImageURL,
									date: commentResp.date
								});

							},
							function(userResp){

							}
						);
					},
					function(resp){
						//if query for comment fails
					}
				);
			}
		}
	};

	$scope.toggleComments = function(comic){
		//open a thing with whatever comments.
		$scope.show_comment = !$scope.show_comment;
	};

	$scope.closeComments = function(){
		$scope.show_comment = false;
	};


	//FAVORITE FUNCTIONS
	//check if user is logged in and followed
	$scope.update_favorite = function() {GAuth.checkAuth().then(
			function(){
				$scope.logged_in = true;
				$scope.user_id = GData.getUser().id;
				//console.log("userid: " +$scope.user_id + " authorid: " + $scope.author_id);
				if($scope.author_id == $scope.user_id){
					//console.log("Comic Author ID: " + $scope.series.authorId);
					//console.log("User ID: " + $scope.user_id);
					$scope.is_owner = true;
				}
				else {
					$scope.is_owner = false;
				}
				//update user
				GApi.execute("c4userendpoint", "getC4User", {"id":$scope.user_id}).then(
					function(resp){
						$scope.user = resp;
						if($scope.user.favoriteComics == null){
							$scope.faved = false;
						}
						else {
							if($scope.user.favoriteComics.indexOf($scope.comic_id.toString()) >= 0){
								$scope.faved = true;
							}
							else{
								$scope.faved = false;
							}
						}
					},
					function(resp){
					}
				);
			},
			function(){
				$scope.logged_in = false;
				$scope.user_id = null;
			}
		);
	};

	$scope.fav = function(){
		GApi.execute("c4userendpoint", "addfavorite", {"userId": $scope.user_id, "comicId": $scope.comic_id}).then(
			function(resp){
				$scope.update_favorite();
				//$scope.subbed = true;
			},
			function(resp){

			}
		);
	};

	$scope.unfav = function(){
		GApi.execute("c4userendpoint", "deletefavorite", {"userId": $scope.user_id, "comicId": $scope.comic_id}).then(
			function(resp){
				$scope.update_favorite();
				//$scope.subbed = false;
			},
			function(resp){

			}
		);
	};

	$scope.updateRating = function(){
		var rating = {
			'userId': $scope.user_id,
			'comicId': id,
			'rating': $scope.rating
		}

		GApi.execute("comicendpoint", "addRating", rating).then(
			function(resp){
				console.log("Updated rating");
			}, function(resp){
				console.log("ERROR updating rating");
		});
	};

	$scope.getComic = function(){
		GApi.execute("comicendpoint", "getComic", {"id": id}).then(
			function(resp){
				var rating = 0;
				var ratingsSum = 0;
				$scope.comment_ids = resp.comments;
				$scope.author_id = resp.authorId;
				$scope.update_comments();
				$scope.update_favorite();
				$scope.comic.title = resp.title;

				GApi.execute("c4userendpoint", "getC4User", {'id': $scope.author_id}).then(
					function(resp){
						$scope.authorName = resp.username;
					}, function(resp){
						console.log("ERROR getting author name")
				});

				$scope.pages = [];
				for(var i = 0; i < resp.pages.length; i++){
					GApi.execute("pageendpoint", "getPage", {'id':resp.pages[i]}).then(
						function(res){
							console.log("here");
							$scope.pages.push({
								'id': res.id,
								'url': imgService.getURL(IMG_PREFIXES.PAGE, res.id),
								'pageNumber': res.pageNumber
							});
						},function(res){
							console.log("ERROR retrieving page")
					});
				}
				//query for series
				if($scope.series == null){
					$scope.seriesId = resp.seriesId;
					if($scope.seriesId != null){
						GApi.execute("seriesendpoint", "getSeries", {"id":resp.seriesId}).then(
							function(resp){
								$scope.series = resp;
								$scope.comic.series = resp.title;
							},
							function(resp){
								//bad things,
								console.log(resp);
							}
						);
					}
				}
			},
			function(resp){
				console.log("ERROR. Comic not found.", resp);
				$state.go('error');
			}
		);
	};

	//main
	$scope.getComic(id);

	var getUserRatingObj = {
		'userId': $cookies.get('userId'),
		'comicId': id
	}
	GApi.execute("comicendpoint", "getUserRating", getUserRatingObj).then(
		function(resp){
			console.log("updating rating");
			$scope.rating = resp.rating;
		}, function(resp){
			console.log("ERROR getting user rating");
			$scope.rating = null;
	});

	//nav functions
	$scope.goToSeries = function(id){
		if(id == null){
			$state.go("error");
		}
		else {
			$state.go("series", {"id":id});
		}
	};

	$scope.goToProfile = function(id){
		if(id == null){
			$state.go("error");
		}
		else {
			$state.go("profile", {"id":id});
		}
	};

	$scope.goToEditComic = function(){
		$state.go("editComic", {"id": id});
	};

}]);
})();
