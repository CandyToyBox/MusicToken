import { createContext, useContext, useState, ReactNode } from "react";

// Notification types
type NotificationType = "success" | "error" | "info";

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [message, setMessage] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [type, setType] = useState<NotificationType>("success");

  // Show notification
  const showNotification = (newMessage: string, newType: NotificationType = "success") => {
    setMessage(newMessage);
    setType(newType);
    setVisible(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  // Hide notification
  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      {/* Notification component */}
      <div className={`fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50 ${visible ? "" : "hidden"}`}>
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden dark:bg-gray-800">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {type === "success" && <i className="fas fa-check-circle text-green-400 text-xl"></i>}
                  {type === "error" && <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>}
                  {type === "info" && <i className="fas fa-info-circle text-blue-400 text-xl"></i>}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button 
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-transparent dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={hideNotification}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

// Standalone component that uses the context internally
export default function Notification() {
  const [message, setMessage] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [type, setType] = useState<NotificationType>("success");

  // Expose the notification functions to the window object for global access
  useState(() => {
    (window as any).showNotification = (newMessage: string, newType: NotificationType = "success") => {
      setMessage(newMessage);
      setType(newType);
      setVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };
  });

  // Hide notification
  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <div className={`fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50 ${visible ? "" : "hidden"}`} id="notification-container">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden dark:bg-gray-800">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {type === "success" && <i className="fas fa-check-circle text-green-400 text-xl"></i>}
                {type === "error" && <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>}
                {type === "info" && <i className="fas fa-info-circle text-blue-400 text-xl"></i>}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button 
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-transparent dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={hideNotification}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
