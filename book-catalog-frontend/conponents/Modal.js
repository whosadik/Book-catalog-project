export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        {children}
        <button
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
