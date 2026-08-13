import MetricsDashboard from '@/components/MetricsDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <MetricsDashboard />
    </main>
  );
}