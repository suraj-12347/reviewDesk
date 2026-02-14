import React from "react";
import clsx from "clsx";

const Textbox = React.forwardRef(
  ({ type, placeholder, label, className, register, name, error }, ref) => {
    return (
      <div className='w-full flex flex-col gap-2'>
        {/* Label */}
        {label && (
          <label htmlFor={name} className='text-slate-800 font-medium text-left'>
            {label}
          </label>
        )}

        {/* Input Box */}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          ref={ref}
          {...register}
          aria-invalid={error ? "true" : "false"}
          className={clsx(
            "w-full px-3 py-2 border border-gray-300  placeholder-gray-500 text-gray-900 outline-none text-base focus:ring-2 ring-blue-300 rounded",
            className
          )}
        />

        {/* Error Message */}
        {error && (
          <span className='text-sm text-red-600 mt-1'>{error}</span>
        )}
      </div>
    );
  }
);

export default Textbox;
