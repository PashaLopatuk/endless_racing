interface Props {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const CarouselDots = ({ count, activeIndex, onSelect }: Props) => {
  if (count <= 1) {
    return null;
  }

  return (
  <div className="carousel-dots">
    {Array.from({ length: count }, (_, index) => (
      <button
        key={index}
        type="button"
        className={`carousel-dots__dot${index === activeIndex ? " carousel-dots__dot--active" : ""}`}
        aria-label={`Select track ${index + 1}`}
        aria-current={index === activeIndex ? "true" : undefined}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(index);
        }}
      />
    ))}
  </div>
  );
};
