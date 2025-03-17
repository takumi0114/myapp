export interface Habit {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

// export interface HabitDTO {
//   id?: number;
//   title: string;
//   description?: string;
//   createdAt?: string;
// }

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit;
  onSave: (habit: Omit<Habit, "id" | "createdAt">) => void;
}
