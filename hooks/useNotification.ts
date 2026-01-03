export function useNotification() {
  const [notification, setNotification] = useState<Notify | null>(null);

  const show = (msg: string, type: NotifyType = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 6000);
  };

  return { notification, show };
}
