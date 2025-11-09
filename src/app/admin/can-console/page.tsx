import CanConsole from '@/components/admin/CanConsole';

export const metadata = {
  title: 'CAN Bus Console | Admin',
};

export default function AdminCanConsolePage() {
  return (
    <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <CanConsole />
    </div>
  );
}

