"use client";

import { SelectedFileItem } from "@/shared/types/global";
import { formatDate } from "@/utils/dateUtils";

type Props = {
  selectedFiles: SelectedFileItem[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFileItem[]>>;
};

export default function FileUploadFields({
  selectedFiles,
  setSelectedFiles,
}: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(
      files.map((file) => ({
        file,
        physicalLocation: "",
				name: file.name,
        description: "",
				date: formatDate(file.lastModified)
      }))
    );
  };

  const handlePhysicalLocationChange = (index: number, value: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, physicalLocation: value } : item
      )
    );
  };

	const handleDescriptionChange = (index: number, value: string) => {
		setSelectedFiles((prev) => 
			prev.map((item, i) => 
				i === index ? { ...item, description: value} : item
			)
		)
	}

	const handleDateChange = (index: number, value: string ) => {
		setSelectedFiles((prev) => 
			prev.map((item, i) => 
				i === index ? { ...item, date: value} : item
			)
		)
	}

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Загрузить файлы
      </label>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
      />

      {selectedFiles.length > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Выбранные Файлы:
          </p>

          <div className="space-y-3">
            {selectedFiles.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="space-y-2">
                <div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Имя Файла
									</label>
									<input
										type="text"
										value={item.file.name}
                    disabled
										className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                <div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Описание (Наименование)
									</label>
									<input
										type="text"
										value={item.description || "" }
										onChange={(e) =>
											handleDescriptionChange(index, e.target.value)
										}
										placeholder="Введите описание"
										className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Местонахождения
									</label>
									<input
										type="text"
										placeholder="Введите местонахождения"
										value={item.physicalLocation}
										onChange={(e) =>
											handlePhysicalLocationChange(index, e.target.value)
										}
										className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Дата
									</label>
									<input
										type="date"
										value={item.date}
										onChange={(e) =>
											handleDateChange(index, e.target.value)
										}
										className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400"
										required
									/>
                </div>

                <div className="py-4">
                  <hr className="border-t border-gray-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}