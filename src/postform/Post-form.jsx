import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../components/index";
import { DatabaseServices } from "../appwrite/config/conf";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const dbservice = new DatabaseServices();
  const [error, setError] = useState(null);  // State for handling errors
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        titles: post?.titles || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    setError(null); // Reset error state before submission
    try {
      // Check if user data exists
      if (!userData || !userData.$id) {
        setError("User data is missing. Please check Redux store.");
        return;
      }

      // Handle file upload
      const file = data.image && data.image[0] 
        ? await dbservice.uploadFile(data.image[0]) 
        : null;

      // Validate slug (ensure it follows Appwrite's requirements)
      const slug = slugTransform(data.titles);
      if (!slug || slug.length > 36) {
        setError("Slug is invalid or too long. It must be alphanumeric and no more than 36 characters.");
        return;
      }
      // Update or Create Post
      if (post) {
        // Updating an existing post
        if (file) {
          await dbservice.deleteFile(post.featureImage); // Delete old image
        }

        const dbPost = await dbservice.updatePost(post.$id, {
          ...data,
          featureImage: file ? file.$id : undefined,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      } else {
        // Creating a new post
        if (file) {
          const dbPost = await dbservice.createPost({
            ...data,
            featureImage: file.$id,
            userID: userData.$id,
          });

          if (dbPost) {
            navigate(`/post/${dbPost.$id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setError("Failed to submit the post. Please try again.");
    }
  };
  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "titles") {
        setValue("slug", slugTransform(value.titles), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("titles", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={dbservice.getFilePreview(post.featureImage)}
              alt={post.titles}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
