import { X } from "lucide-react";

export default function CreateFolderModal({ selectedFiles } : {selectedFiles : File[]} ) {


	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
					<button
						onClick={closeModal}
						className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleCreateFolder} className="space-y-4">
					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Folder Name
						</label>
						<input
							type="text"
							value={folderName}
							onChange={(e) => setFolderName(e.target.value)}
							placeholder="Enter folder name"
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Folder Date
						</label>
						<input
							type="date"
							value={folderDate}
							onChange={(e) => setFolderDate(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Upload Files
						</label>
						<input
							type="file"
							multiple
							onChange={handleFileChange}
							className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
						/>
					</div>

					{selectedFiles.length > 0 && (
						<div className="rounded-xl bg-gray-50 p-4">
							<p className="mb-2 text-sm font-medium text-gray-700">Selected files:</p>
							<ul className="space-y-1 text-sm text-gray-600">
								{selectedFiles.map((file, index) => (
									<li key={`${file.name}-${index}`} className="truncate">
										{file.name}
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={closeModal}
							className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}