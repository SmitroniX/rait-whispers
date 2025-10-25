import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ConfessionCardProps = {
  confession: {
    id: string;
    content: string;
    created_at: string;
  };
  isAdmin?: boolean;
  onDelete?: () => void;
};

export const ConfessionCard = ({ confession, isAdmin, onDelete }: ConfessionCardProps) => {
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userLikeId, setUserLikeId] = useState<string | null>(null);

  useEffect(() => {
    fetchLikesCount();
    fetchCommentsCount();
    checkIfLiked();
    
    if (showComments) {
      fetchComments();
    }
  }, [confession.id, showComments]);

  const fetchLikesCount = async () => {
    const { count } = await supabase
      .from("confession_likes")
      .select("*", { count: "exact", head: true })
      .eq("confession_id", confession.id);
    setLikesCount(count || 0);
  };

  const fetchCommentsCount = async () => {
    const { count } = await supabase
      .from("confession_comments")
      .select("*", { count: "exact", head: true })
      .eq("confession_id", confession.id);
    setCommentsCount(count || 0);
  };

  const checkIfLiked = async () => {
    const ipAddress = localStorage.getItem("user_ip") || "unknown";
    const { data } = await supabase
      .from("confession_likes")
      .select("id")
      .eq("confession_id", confession.id)
      .eq("ip_address", ipAddress)
      .maybeSingle();
    
    if (data) {
      setIsLiked(true);
      setUserLikeId(data.id);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("confession_comments")
      .select("*")
      .eq("confession_id", confession.id)
      .order("created_at", { ascending: false });
    setComments(data || []);
  };

  const handleLike = async () => {
    const ipAddress = localStorage.getItem("user_ip") || "unknown";

    if (isLiked && userLikeId) {
      await supabase.from("confession_likes").delete().eq("id", userLikeId);
      setIsLiked(false);
      setUserLikeId(null);
      fetchLikesCount();
    } else {
      const { data } = await supabase
        .from("confession_likes")
        .insert([{ confession_id: confession.id, ip_address: ipAddress }])
        .select()
        .single();
      
      if (data) {
        setIsLiked(true);
        setUserLikeId(data.id);
        fetchLikesCount();
      }
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("confession_comments")
      .insert([{ confession_id: confession.id, content: newComment.trim() }]);

    if (!error) {
      setNewComment("");
      fetchComments();
      fetchCommentsCount();
      toast.success("Comment added!");
    }
  };

  const handleDeleteConfession = async () => {
    if (!confirm("Are you sure you want to delete this confession?")) return;

    const { error } = await supabase
      .from("confessions")
      .delete()
      .eq("id", confession.id);

    if (!error) {
      toast.success("Confession deleted");
      onDelete?.();
    }
  };

  return (
    <Card className="confession-card p-4 lg:p-6 border-primary/20 animate-fade-in">
      <p className="text-sm lg:text-base text-foreground leading-relaxed mb-4 whitespace-pre-wrap break-words">
        {confession.content}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <time className="text-xs lg:text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
        </time>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`${isLiked ? "text-primary" : ""} text-xs lg:text-sm`}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-xs lg:text-sm"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {commentsCount}
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteConfession}
              className="text-destructive text-xs lg:text-sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="border-t border-primary/20 pt-4 space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm break-words">{comment.content}</p>
                  <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </time>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] flex-1 text-sm"
              maxLength={500}
            />
            <Button 
              onClick={handleComment} 
              className="sm:self-end"
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
