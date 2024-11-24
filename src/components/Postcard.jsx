import React from "react";
import dbservice, { DatabaseServices } from "../appwrite/config/conf";
import { Link } from "react-router-dom";

function Postcard({ $id, titles , featureImage }) {
  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full justify-center mb-4">
          <img
            src={dbservice.getFilePreview(featureImage)}
            alt={titles || "Post image"}
            className="rounded-xl"
          />
          
        </div>
        <h2 className="text-xl font-bold">{titles}</h2>
      </div>
    </Link>
  );
}

export default Postcard;
