import React from "react";

const CategoryList = ({ categories = [] }) => {
  if (!categories.length) {
    return (
      <div className="p-4 text-gray-400">
        No categories available
      </div>
    );
  }

  return (
    <div className="grid gap-6 
                    grid-cols-1 
                    sm:grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4">
      {categories.map((category) => (
        <div
          key={category._id}
          className="p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <h3 className="text-blue-600 font-semibold text-lg mb-3">
            {category.name}
          </h3>

          {category.subCategories?.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {category.subCategories.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">
              No subcategories
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;