import { Badge, Button, Card } from "flowbite-react";
import { ArrowRight, HeartHandshake, Leaf, QrCode, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";

const values = [
  { icon: Leaf, title: "Dùng lâu hơn", text: "Mỗi vật phẩm được chia sẻ là một lần giảm mua mới và giảm lãng phí." },
  { icon: HeartHandshake, title: "Tin nhau hơn", text: "Karma ghi nhận đóng góp, giúp cộng đồng hình thành uy tín qua hành động." },
  { icon: Users, title: "Gần nhau hơn", text: "Trao đổi trong khuôn viên giúp việc gặp mặt, giao nhận và hỗ trợ trở nên đơn giản." },
];

export default function About() {
  return (
    <UserLayout>
      <div className="space-y-12 pb-10">
        <section className="editorial-grid overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-10 lg:p-14">
              <Badge color="warning" className="mb-6 w-fit">Về dự án</Badge>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.06] text-slate-950 sm:text-6xl dark:text-white">
                Khuôn viên bền vững bắt đầu từ một lần <span className="text-amber-700 dark:text-amber-400">sẵn lòng chia sẻ.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Campus Karma Exchange giúp sinh viên tặng, cho mượn và trao đổi những vật dụng còn giá trị bằng một hệ thống tín nhiệm minh bạch.
              </p>
              <Button as={Link} to="/browse" size="lg" className="mt-8">
                Khám phá cộng đồng <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative min-h-80 overflow-hidden bg-slate-950 p-8 text-white sm:p-10">
              <div className="absolute -right-14 -top-14 h-56 w-56 rounded-full border-[36px] border-amber-400/10" />
              <Sparkles className="h-8 w-8 text-amber-400" aria-hidden="true" />
              <blockquote className="relative mt-16 font-display text-3xl font-medium leading-tight sm:text-4xl">
                “Đồ vật có thể đổi chủ. Giá trị tốt đẹp thì được nhân lên.”
              </blockquote>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Campus Karma Manifesto</p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">Điều chúng tôi tin</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">Ba giá trị cốt lõi</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, index) => (
              <Card key={title}>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-amber-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold tracking-[0.16em] text-slate-300 dark:text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-slate-950 dark:text-white">{title}</h3>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Xác thực sinh viên", text: "Email trường tạo một cộng đồng có danh tính rõ ràng." },
              { icon: QrCode, title: "Giao nhận bằng QR", text: "Mỗi bước trao và nhận đều được xác nhận tại chỗ." },
              { icon: HeartHandshake, title: "Bảo vệ bằng Karma", text: "Điểm cọc giúp hai bên có trách nhiệm với cam kết." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-l border-white/15 pl-5">
                <Icon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
