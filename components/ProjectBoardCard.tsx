import Link from "next/link";

type ProjectBoardCardProps = {
  id: string;
  name: string;
  createdAt: string;
};

export default function ProjectBoardCard({
  id,
  name,
  createdAt,
}: ProjectBoardCardProps) {
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/boards/${id}`}
      className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-6 pt-6 pb-px w-[308px] h-[105px] flex flex-col gap-2 hover:shadow-md transition-shadow"
    >
      <p className="text-text text-lg font-medium leading-[27px] tracking-[-0.44px] whitespace-nowrap truncate">
        {name}
      </p>
      <p className="text-muted text-sm leading-5 tracking-[-0.15px]">{date}</p>
    </Link>
  );
}
