import UserLayout from '../layouts/UserLayout';

export default function About() {
  return (
    <UserLayout>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Về Campus Karma Exchange</h1>
        <p className="mt-3 text-slate-600 dark:text-gray-300">
          Nền tảng giúp sinh viên chia sẻ và mượn đồ dùng bằng điểm tín nhiệm Karma.
        </p>
      </section>
    </UserLayout>
  );
}
