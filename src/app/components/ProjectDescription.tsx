const ProjectDescription = () => {
  return (
    <div className="container w-[80%] py-8">
      <h1 className="text-2xl font-bold mb-4">
        1382. Balance a Binary Search Tree
      </h1>
      <div className="mb-6">
        <span className="bg-yellow-500 text-white py-1 px-3 rounded-full text-sm font-semibold mr-2">
          Medium
        </span>
        <span className="bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-sm font-semibold mr-2">
          Topics
        </span>
        <span className="bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-sm font-semibold">
          Discuss project
        </span>
      </div>
      <p className="mb-4">
        Given the <code>root</code> of a binary search tree, return a{" "}
        <strong>balanced binary search tree</strong> with the same node values.
        If there is more than one answer, return <em>any of them</em>.
      </p>
      <p className="mb-4">
        A binary search tree is <strong>balanced</strong> if the depth of the
        two subtrees of every node never differs by more than <strong>1</strong>
        .
      </p>
      <h2 className="text-xl font-semibold mb-2">Example 1:</h2>
      <div className="mb-4">
        <img src="/example1.png" alt="Example 1" className="mb-2" />
        <p>
          <strong>Input:</strong> root = [1,null,2,null,3,null,4,null,null]
        </p>
        <p>
          <strong>Output:</strong> [2,1,3,null,null,null,4]
        </p>
        <p>
          <strong>Explanation:</strong> This is not the only correct answer,
          [3,1,4,null,2] is also correct.
        </p>
      </div>
    </div>
  );
};

export default ProjectDescription;
