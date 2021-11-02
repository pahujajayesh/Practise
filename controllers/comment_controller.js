const Comment=require('../models/comment');
const Post=require('../models/post');
const commentsMailer=require('../mailers/comments_mailer');


    module.exports.create=async function(req,res){
        try{
        let post =await Post.findById(req.body.post);
        if(post){
            console.log("post is there");
            let comment=await Comment.create({
                content:req.body.content,
                post:req.body.post,
                user:req.user._id
            });
                console.log("comment isthere");
                post.comments.push(comment);
                post.save();

                comment = await comment.populate('user', 'name email');
                console.log("inside xhr");
                commentsMailer.newComment(comment);
                if(req.xhr){
                    return res.status(200).json({
                        data: {
                            comment: comment
                        },
                        message: "Post created!"
                    });
                }
                req.flash('success','Comment created successfully!!')
                return res.redirect('/');
        }
    }

catch(err){
    console.log("some error occured");

    req.flash("error", err);
  return res.redirect("back");
}
    }


    module.exports.destroy=async function(req,res){
        try{
        let comment=await Comment.findById(req.params.id)
            if(comment.user==req.user.id){
                let postId=comment.post;
                comment.remove();
                let post=await Post.findByIdAndUpdate(postId,{$pull:{comment:req.params.id}});
                if(req.xhr){
                    return res.status(200).json({
                        data: {
                            comment_id: req.params.id
                        },
                        message: "Post deleted"
                    });
                }
                    req.flash('success','Comment deleted successfully');
                    return res.redirect('back');
            }
            else{
                req.flash('error',"you cannot delete this comment")
                return res.redirect('back');
            }
    }

catch(err){
    req.flash("error", err);
  return res.redirect("back");
}
}
