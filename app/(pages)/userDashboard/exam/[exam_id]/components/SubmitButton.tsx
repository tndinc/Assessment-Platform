export default function SubmitButton({ onSubmit, disabled }) {
    return (
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`w-full py-2 px-4 rounded-lg text-white font-semibold text-sm md:text-base transition-colors duration-200 ${
          disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        Submit Exam
      </button>
    )
  }
  
  