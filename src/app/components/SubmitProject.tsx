import SubmissionButton from "./ui/SubmissionButton";

const SubmitProject = () => {
  return (
    <div className="flex gap-5">
      <input
        type="text"
        className="flex-1 p-2 bg-white focus:outline-none rounded-md shadow-md text-gray-900"
        placeholder="Paste github link of your project here"
      />{" "}
      <button className="bg-orange-500 text-grey-700 text-white px-6 py-3 text-lg rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold">
        Submit
      </button>
    </div>
  );
};

export default SubmitProject;
