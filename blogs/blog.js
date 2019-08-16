var blogInfo;
var iteration = 0;
var currentPostId;
var currentReq = 0;
var initialLoad = false;
var showingAll = [];
var currentUsername;
var localize = function(string) {
    return string;
}

var emptyString = localize("There's no content here yet, but check back soon!");

$(document).ready(function() {
    if (document.getElementById('blogContent') && !document.getElementById('postSection')) {
        if (window.self == window.top) {
            getBlog(iteration);
        } else {
            emptyString = localize("Posts don't show up in the editor.");
            addEmptyBlog();
        }
    } else if (document.getElementById('postSection') && window.self == window.top) {
        getPostWithId();
    }
});

var getBlog = function(req) {
    blogLoading();
    currentReq = req;
    
    $.ajax({
        url: '/blogs/getPosts.php?req=' + req.toString(),
        type: 'GET',
        success: function(data) {
            try {
                blogInfo = JSON.parse(data);
                if (blogInfo.posts.length > 0) {
                    iteration = currentReq;
                    addPosts();
                    if (initialLoad) {
                        $('html, body').stop().animate({
                            scrollTop: ($("#blogContent").offset().top - 50)
                        }, 1250, 'easeInOutExpo');   
                    } else {
                        initialLoad = true;
                    }
                } else {
                    addEmptyBlog();
                }
            } catch (err) {
                addEmptyBlog();
            }
        },
        error: function(err) {
            console.log(err);
            addEmptyBlog();
        }
    });
}

var addEmptyBlog = function() {
    var h3 = document.createElement('h3');
    var text = document.createTextNode(emptyString);
    h3.appendChild(text);
    
    while (document.getElementById('blogContent').firstChild) {
        document.getElementById('blogContent').removeChild(document.getElementById('blogContent').firstChild);
    }
    
    document.getElementById('blogContent').style.textAlign = 'center';
    document.getElementById('blogContent').style.width = '100%';
    h3.style.fontSize = '25px';
    h3.id = "blogEmptyString";
    
    document.getElementById('blogContent').appendChild(h3);
}

var addPosts = function() {
    var thisUser = blogInfo.thisUser;
    var maxPosts = blogInfo.maxPosts;
    var canGetMore = blogInfo.canGetMore;
    
    if (maxPosts > blogInfo.posts.length || maxPosts == 0) {
        maxPosts = blogInfo.posts.length;
        canGetMore = false;
    }
    
    while (document.getElementById('blogContent').firstChild) {
        document.getElementById('blogContent').removeChild(document.getElementById('blogContent').firstChild);
    }
    
    var rowCount = 0;
    var currentRow = undefined;
    var className = 'postDiv outerGrid col-md-4';
    var startClass = '';
    if (maxPosts === 1) {
        startClass = 'col-md-offset-4';
    } else if (maxPosts === 2) {
        startClass = 'col-md-offset-2';
    }
    
    for (var i = 0; i < maxPosts; i++) {
        //TODO: Create a box for the post with the image and the title
        var postOuter = document.createElement("div");
        var postDiv = document.createElement('div');
        var postImage = document.createElement('img');
        var postTitle = document.createElement("h3");
        var useClass = className;
        if (i == 0 && startClass !== '') {
            useClass = className + ' ' + startClass;
        }
        
        postOuter.className = useClass;
        postDiv.className = 'innerGridTable postDivInner';
        postTitle.className = 'innerTableContent';
        postTitle.appendChild(document.createTextNode(blogInfo.posts[i].title));
        if (blogInfo.posts[i].image !== '') {
            if (blogInfo.posts[i].image.indexOf('https') !== -1) {
                postDiv.style.backgroundImage = "url(" + blogInfo.posts[i].image + ")";
            } else if (blogInfo.posts[i].image.indexOf('img/') !== -1) {
                postDiv.style.backgroundImage = "url(" + blogInfo.posts[i].image + ")";
            } else {
                postDiv.style.backgroundImage = "url(/img/" + blogInfo.posts[i].image + ")";
            }
        }
        
        postDiv.appendChild(postTitle);
        postDiv.setAttribute('name', i.toString());
        postDiv.onclick = function() {
            displayPost(parseInt(this.getAttribute('name')));
        }
        
        postOuter.appendChild(postDiv);
        
        if (rowCount === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row';
            currentRow.appendChild(postOuter);
            rowCount++;
        } else if (rowCount === 1) {
            currentRow.appendChild(postOuter);
            rowCount++;
        } else if (rowCount === 2) {
            currentRow.appendChild(postOuter);
            document.getElementById('blogContent').appendChild(currentRow);
            rowCount = 0;
        }
    }
    
    if (rowCount !== 0 && currentRow !== undefined) {
        document.getElementById('blogContent').appendChild(currentRow);
    }
    
    if (iteration > 0) {
        var button = document.createElement('button');
        var buttonText = document.createTextNode("Prev");
        button.className = 'commentButton nextButtonBlog';
        
        if (!canGetMore) {
            button.style.marginRight = '0';
        }
        
        button.appendChild(buttonText);
        button.onclick = function() {
            getBlog(iteration - 1);
        }
        
        document.getElementById('blogContent').appendChild(button);
    }
    
    if (canGetMore) {
        var button = document.createElement('button');
        var buttonText = document.createTextNode("Next");
        button.className = 'commentButton nextButtonBlog';
        button.style.marginRight = '0';
        
        if (iteration > 0) {
            button.style.marginLeft = '2%';
        } 
        
        button.appendChild(buttonText);
        button.onclick = function() {
            getBlog(iteration + 1);
        }
        
        document.getElementById('blogContent').appendChild(button);
    }
    
    for (var i = 0; i < showingAll.length; i++) {
        showComments(showingAll[i]);
    }
    
    var squares = document.getElementById('blogContent').getElementsByClassName('innerTableContent');
    for (var i = 0; i < squares.length; i++) {
        squares[i].style.maxWidth = squares[i].parentElement.parentElement.offsetWidth.toString() + 'px';
    }
}

var getPostWithId = function() {
    $.ajax({
        url: '/blogs/getPost.php?id=' + document.getElementById('postId').innerHTML,
        type: 'GET',
        success: function(data) {
            blogInfo = JSON.parse(data);
            if (document.getElementById('postCommentable').innerHTML === 'true') {
                addComments(document.getElementById(document.getElementById('postId').innerHTML), blogInfo.posts[0]);
            }
        },
        error: function(err) {
            console.log(err);
        }
    })
}

var displayPost = function(i) {
    if (blogInfo.posts[i].ownPage !== 'false') {
        window.location.href = '/' + blogInfo.posts[i].ownPage;
        return;
    }
    
    var postId = blogInfo.posts[i].postId;
    var overlay = document.createElement('div');
    var closeBlog = document.createElement('span');
    var post = document.createElement('div');
    var postStuff = document.createElement('div');
    var postTitle = document.createElement('span');
    var postDate = document.createElement('span');
    var postEdit = document.createElement('span');
    var postContent = document.createElement('div');
    var titleText = document.createTextNode(blogInfo.posts[i].title);
    var dateText = document.createTextNode(localize("Posted on ") + blogInfo.posts[i].posted);
    var contentText = $.parseHTML(blogInfo.posts[i].content.replace("\"\"", "\"").split('\n').join('<br>'));
    
    postStuff.className = 'postStuff';
    postTitle.className = 'postTitle';
    postDate.className = 'postDate';
    postEdit.className = 'postEdit';
    postContent.className = 'postContent';
    closeBlog.className = 'closeBlog';
    overlay.className = 'blogOverlay';
    overlay.id = 'blogOverlay';
    
    closeBlog.appendChild(document.createTextNode("X"));
    postTitle.appendChild(titleText);
    postStuff.appendChild(postTitle);
    
    postDate.appendChild(dateText);
    postStuff.appendChild(postDate);
    
    for (var j = 0; j < contentText.length; j++) {
        postContent.appendChild(contentText[j]);    
    }
    
    postStuff.appendChild(postContent);
    post.appendChild(postStuff);
    
    if (blogInfo.posts[i].commentable) {
        post = addComments(post, blogInfo.posts[i]);
    }
    
    closeBlog.onclick = function() {
        document.body.removeChild(document.getElementById('blogOverlay'));
    }
    
    post.id = postId;
    post.className = 'blogPost';
    overlay.appendChild(closeBlog);
    overlay.appendChild(post);
    document.body.appendChild(overlay);
}

var addComments = function(div, post) {
    var postId = post.postId;
    var maxPosts = 2;
    
    if (showingAll.indexOf(postId) !== -1) {
        maxPosts = post.comments.length;
    }
    
    var iStart = post.comments.length - maxPosts;
    
    if (iStart < 0) {
        iStart = 0;
    }
    
    var commentDiv = document.createElement('div');
    commentDiv.className = 'commentDiv';
    
    if (iStart !== 0) {
        var viewMore = document.createElement('a');
        var viewText = document.createTextNode(localize('Show All'));
        viewMore.appendChild(viewText);
        viewMore.className = 'viewMoreComments';
        viewMore.setAttribute('name', postId);
        viewMore.onclick = function() {
            showComments(this);
        }
        
        commentDiv.appendChild(viewMore);
    } else if (post.comments.length > 2) {
        var viewMore = document.createElement('a');
        var viewText = document.createTextNode(localize('Hide'));
        viewMore.appendChild(viewText);
        viewMore.className = 'viewMoreComments';
        viewMore.setAttribute('name', postId);
        viewMore.onclick = function() {
            hideComments(this);
        }
        
        commentDiv.appendChild(viewMore);
    }
    
    for (var i = iStart; i < post.comments.length; i++) {
        var comment = document.createElement('div');
        var p = document.createElement('p');
        var user = document.createElement('span');
        var date = document.createElement('span');
        var pText = document.createTextNode(post.comments[i].comment);
        var nameText = document.createTextNode(post.comments[i].username + ": ");
        var dateText = document.createTextNode(post.comments[i].date);
        
        user.className = 'commentUser';
        date.className = 'commentDate';
        p.className = 'commentText';
        
        date.appendChild(dateText);
        p.appendChild(date);
        user.appendChild(nameText);
        p.appendChild(user);
        p.appendChild(pText);
        comment.appendChild(p);
        commentDiv.appendChild(comment);
    }
    
    var commentSection = document.createElement('textarea');
    var commentButton = document.createElement('button');
    var btnText = document.createTextNode(localize("Send"));
    
    commentButton.className = 'commentButton';
    commentButton.setAttribute('name', postId);
    commentSection.className = 'commentSection';
    commentSection.setAttribute('placeholder', localize('Write a comment...'));
    commentButton.appendChild(btnText);

    commentDiv.appendChild(commentSection);
    commentDiv.appendChild(commentButton);
    
    commentButton.onclick = function() {
        sendComment(this.getAttribute('name'));
    }
    
    div.appendChild(commentDiv);
    return div;
}

var showComments = function(btn) {
    if (btn.toString().length === 0) {
        showingAll.push(btn.getAttribute('name'));
        for (var i = 0; i < blogInfo.posts.length; i++) {
            if (blogInfo.posts[i].postId === btn.getAttribute('name')) {
                document.getElementsByClassName('commentDiv')[0].parentElement.removeChild(document.getElementsByClassName('commentDiv')[0]);
                addComments(document.getElementById(btn.getAttribute('name')), blogInfo.posts[i]);
                break;
            }
        }
    }
}

var hideComments = function(btn) {
    showingAll.splice(showingAll.indexOf(btn.getAttribute('name')), 1);
    for (var i = 0; i < blogInfo.posts.length; i++) {
        if (blogInfo.posts[i].postId === btn.getAttribute('name')) {
            document.getElementsByClassName('commentDiv')[0].parentElement.removeChild(document.getElementsByClassName('commentDiv')[0]);
            addComments(document.getElementById(btn.getAttribute('name')), blogInfo.posts[i]);
            break;
        }
    }
}

var blogLoading = function() {
    while (document.getElementById('blogContent').firstChild) {
        document.getElementById('blogContent').removeChild(document.getElementById('blogContent').firstChild);
    }
    
    var div = document.createElement('div');
    var img = document.createElement('img');
    div.style.textAlign = 'center';
    div.style.width = '100%';
    img.setAttribute('src', '/img/blogLoader.gif');
    img.style.height = '70px';
    div.appendChild(img);
    document.getElementById('blogContent').appendChild(div);
}

var sendComment = function(postId) {
    if (document.getElementById(postId).getElementsByClassName('commentSection')[0].value === '') {
        swal(localize('Uh Oh!'), localize('You need to enter some text in order to comment.'), 'error');
        document.body.className = '';
        return;
    } else {
        currentPostId = postId;
    }
    
    if (blogInfo.thisUser.username === "") {
        createUser(document.getElementById(postId).getElementsByClassName('commentSection')[0].value);
    } else {
        appendSpinner();
        $.ajax({
            url: '/blogs/comment.php?req=' + iteration.toString(),
            type: 'POST',
            data: {'content': document.getElementById(postId).getElementsByClassName('commentSection')[0].value, 'postId': currentPostId},
            success: function(data) {
                removeSpinner();
                try {
                    blogInfo = JSON.parse(data);
                    for (var i = 0; i < blogInfo.posts.length; i++) {
                        if (blogInfo.posts[i].postId === currentPostId) {
                            document.getElementsByClassName('commentDiv')[0].parentElement.removeChild(document.getElementsByClassName('commentDiv')[0]);
                            addComments(document.getElementById(currentPostId), blogInfo.posts[i]);
                            break;
                        }
                    }
                } catch (err) {
                    if (data !== '') {
                        swal('Uh Oh!', data, 'error');
                    } else {
                        regetBlog();
                    }
                }
            },
            error: function(err) {
                console.log(err);
                removeSpinner();
                swal({
                    title: localize("Uh Oh!"),
                    text: localize("There seems to be an issue posting this comment. Please try again later."),
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                }, function(){
                    window.location.reload();
                });
                
                document.body.className = '';
            }
        })    
    }
}

var regetBlog = function() {
    appendSpinner();
    
    $.ajax({
        url: '/blogs/getPosts.php?req=' + currentReq.toString(),
        type: 'GET',
        success: function(data) {
            removeSpinner();
            
            try {
                blogInfo = JSON.parse(data);
                for (var i = 0; i < blogInfo.posts.length; i++) {
                    if (blogInfo.posts[i].postId === currentPostId) {
                        document.getElementsByClassName('commentDiv')[0].parentElement.removeChild(document.getElementsByClassName('commentDiv')[0]);
                        addComments(document.getElementById(currentPostId), blogInfo.posts[i]);
                        break;
                    }
                }
            } catch (err) {
                addEmptyBlog();
            }
        },
        error: function(err) {
            console.log(err);
            addEmptyBlog();
        }
    });
}

var localize = function(string) {
    return string;
}

var createUser = function(comment) {
    swal({
        title: localize("Username"),
        text: localize('Enter a username:'),
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: true
    }, function(inputValue){
        if (inputValue !== false) {
            checkUsername(inputValue);   
        }
    });
    
    document.body.className = '';
}

var checkUsername = function(username) {
    currentUsername = username;
    appendSpinner();
    
    $.ajax({
        url: '/blogs/checkUser.php',
        type: 'GET',
        data: {'username': username},
        success: function(data) {
            removeSpinner();
            if (data === "registered") {
                getPassword(currentUsername);
            } else {
                setPassword(currentUsername);
            }
        },
        error: function(err) {
            console.log(err);
            removeSpinner();
            swal({
                title: localize("Uh Oh!"),
                text: localize("There seems to be an issue checking this username. Please try again later."),
                type: "error",
                showCancelButton: false,
                confirmButtonText: localize("Ok"),
                closeOnConfirm: true
            }, function(){
                window.location.reload();
            });
            
            document.body.className = '';
        }
    })
}

var getPassword = function(username) {
    swal({
        title: localize("Password"),
        text: localize('This username already exists. If it\'s you, please enter the password for it:'),
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: true
    }, function(inputValue) {
        if (inputValue !== false) {
            submitUser(inputValue);
        }
    });
    
    document.body.className = '';
}

var setPassword = function(username) {
    swal({
        title: localize("Password"),
        text: localize('Choose a password for your username:'),
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: true
    }, function(inputValue) {
        if (inputValue !== false) {
            submitUser(inputValue);
        }
    });
    
    document.body.className = '';
}

var submitUser = function(password) {
    appendSpinner();
    
    $.ajax({
        url: '/blogs/user.php',
        type: 'POST',
        data: {'username': currentUsername, 'password': password},
        success: function(data) {
            removeSpinner();
            if (data === "success") {
                blogInfo.thisUser.username = currentUsername;
                
                var userNames = document.getElementsByClassName('username');
                for (var i = 0; i < userNames.length; i++) {
                    var un = userNames[i];
                    if (un.firstChild) {
                        un.removeChild(un.firstChild);
                    }
                    
                    var tn = document.createTextNode(currentUsername);
                    un.appendChild(tn);
                }
                
                swal(localize('Success!'), localize('You\'re signed in! Go ahead and post your comment.'), 'success');
            } else {
                swal(localize('Uh Oh!'), data, 'error');
                document.body.className = '';
            }
        },
        error: function(err) {
            console.log(err);
            removeSpinner();
            swal({
                title: localize("Uh Oh!"),
                text: localize("There seems to be an issue checking this username. Please try again later."),
                type: "error",
                showCancelButton: false,
                confirmButtonText: localize("Ok"),
                closeOnConfirm: true
            }, function(){
                window.location.reload();
            });
            
            document.body.className = '';
        }
    });
}

var removeSpinner = function() {
    document.getElementById('spinnerLoading').parentElement.removeChild(document.getElementById('spinnerLoading'));
}

var addedSpinner = false;
var addSpinnerStyle = function() {
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(".spinnerLoading {border: 16px solid #f3f3f3; /* Light grey */border-top: 16px solid #3498db; /* Blue */border-radius: 50%;width: 120px;height: 120px;animation: spin 2s linear infinite;}@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}"));
    document.body.appendChild(style);
};

var appendSpinner = function() {
    var spinner = document.createElement('div');
    var outer = document.createElement('div');
    
    outer.id = 'spinnerLoading';
    spinner.className = 'spinnerLoading';
    outer.style.background = 'rgba(0,0,0,0.7)';
    outer.style.borderRadius = '20px';
    outer.style.position = 'fixed';
    outer.style.left = ((window.innerWidth - 205) / 2).toString() + 'px';
    outer.style.width = '205px';
    outer.style.top = '30%';
    outer.style.height = '205px';
    outer.style.zIndex = '10000';
    spinner.style.marginLeft = '42.5px';
    spinner.style.marginTop = '42.5px';
    outer.appendChild(spinner);
    document.body.appendChild(outer);
    
    if (!addedSpinner) {
        addedSpinner = true;
        addSpinnerStyle();
    }
}
