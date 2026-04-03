import { FileCardInfoState } from "@/shared/types/global";
import { formatDate } from "@/utils/dateUtils";
import { X } from "lucide-react";
import { SubmitEvent, useState } from "react";

type Props = {
  closeEditModal: () => void;
  handleEditFile: (e: SubmitEvent<Element>) => void;
  isFolderUpdating: boolean;
  editForm: FileCardInfoState;
  setEditForm: React.Dispatch<React.SetStateAction<FileCardInfoState>>;
};

export default function EditFileModal({
  closeEditModal,
  handleEditFile,
  isFolderUpdating,
  editForm,
  setEditForm,
}: Props) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
				<div className="mb-5 flex items-center justify-between">
					<h3 className="text-xl font-semibold text-gray-900">Изменить Файл</h3>
					<button
						onClick={closeEditModal}
						className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleEditFile} className="space-y-4">
					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Описание (Наименование) Файла
						</label>
						<input
							type="text"
							value={editForm.description || ''} 
							onChange={(e) =>
								setEditForm((prev) => ({ ...prev, description: e.target.value }))
							}
							required
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Дата Файла
						</label>
						<input
							type="date"
							value={formatDate(editForm.date)}
							onChange={(e) =>
								setEditForm((prev) => ({ ...prev, date: e.target.value }))
							}
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Местонахождения
						</label>
						<input
							type="text"
							value={editForm.physicalLocation || ''}
							onChange={(e) =>
								setEditForm((prev) => ({
									...prev,
									physicalLocation: e.target.value,
								}))
							}
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={closeEditModal}
							className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							отменить
						</button>
						<button
							type="submit"
							disabled={isFolderUpdating}
							className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Сохранить
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}