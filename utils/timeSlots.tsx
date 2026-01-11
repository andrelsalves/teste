export const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
};
