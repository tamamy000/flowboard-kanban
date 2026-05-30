type TaskCardProps = {
  title: string;
  onClick?: () => void;
};

export default function TaskCard({ title, onClick }: TaskCardProps) {
  return (
    <div
      className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-px cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      <p className="text-text text-sm leading-5 tracking-[-0.15px]">{title}</p>
    </div>
  );
}
