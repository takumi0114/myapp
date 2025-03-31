// components/DetailModal.tsx
import { X, Clock } from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: any;
  date: string;
}

export function DetailModal({
  isOpen,
  onClose,
  detail,
  date,
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">{date}</h2>

        {detail ? (
          <div>
            {detail.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">メモ</h3>
                <p className="ml-2 text-gray-800">{detail.notes}</p>
              </div>
            )}

            {detail.duration && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  所要時間
                </h3>
                <div className="ml-2 flex items-center text-gray-800">
                  <Clock size={16} className="mr-2" />
                  <span>{detail.duration}分</span>
                </div>
              </div>
            )}

            {detail.photo && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">画像</h3>
                <img
                  src={`http://localhost:8080/${detail.photo}`}
                  alt="記録画像"
                  className="ml-2 rounded-lg max-h-64 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            この日の詳細記録はありません
          </div>
        )}
      </div>
    </div>
  );
}
