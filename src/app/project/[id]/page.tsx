import MentorChat from "@/app/components/MentorChat";
import ProjectDescription from "@/app/components/ProjectDescription";
import SubmitProject from "@/app/components/SubmitProject";
import React from "react";

const Project = () => {
  return (
    <div className="grid grid-flow-col px-20">
      <div>
        <ProjectDescription />
      </div>
      <div>
        <MentorChat />
        <SubmitProject />
      </div>
    </div>
  );
};

export default Project;
