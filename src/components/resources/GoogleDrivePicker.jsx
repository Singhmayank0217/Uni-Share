"use client"

import { useState } from "react"
import useDrivePicker from "react-google-drive-picker"
import { FiCloud, FiLoader } from "react-icons/fi"
import toast from "react-hot-toast"

const GoogleDrivePicker = ({ onFileSelect }) => {
  const [openPicker, authResponse] = useDrivePicker()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const handleOpenPicker = () => {
    setLoading(true)

    openPicker({
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      developerKey: process.env.REACT_APP_GOOGLE_API_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        setLoading(false)
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button")
          return
        }

        if (data.action === "picked") {
          const files = data.docs
          console.log("Selected files:", files)
          setSelectedFiles(files)
          onFileSelect(files)
          toast.success(`${files.length} file(s) selected from Google Drive`)
        }
      },
    })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold dark:text-white flex items-center">
          <FiCloud className="text-blue-500 mr-2" /> Select from Google Drive
        </h3>
      </div>

      <button
        type="button"
        onClick={handleOpenPicker}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin mr-2" /> Opening Google Drive...
          </>
        ) : (
          <>
            <FiCloud className="mr-2" /> Select Files from Google Drive
          </>
        )}
      </button>

      {selectedFiles.length > 0 && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Selected Files ({selectedFiles.length})</h4>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file) => (
              <li key={file.id} className="flex items-center text-sm">
                {file.iconUrl && <img src={file.iconUrl || "/placeholder.svg"} alt="" className="w-5 h-5 mr-2" />}
                <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default GoogleDrivePicker
