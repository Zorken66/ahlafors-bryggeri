type ProductImageFrameProps = {
  image: string;
  name: string;
  className?: string;
  imageClassName?: string;
};

export default function ProductImageFrame({
  image,
  name,
  className = "",
  imageClassName = "",
}: ProductImageFrameProps) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-b from-stone-50 via-white to-stone-200 ${className}`}>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-stone-900/18 via-stone-900/6 to-transparent" />
      <img
        src={image}
        alt={name}
        className={`relative z-10 h-full w-full object-contain object-center ${imageClassName}`}
      />
    </div>
  );
}
