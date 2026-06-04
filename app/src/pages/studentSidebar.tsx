import {
  Home,
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  Calendar,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";

export function getStudentSidebarSections(studentId: string) {
  return [
    {
      items: [
        { icon: <Home size={16} />, label: "Inicio", to: `/student/${studentId}` },
        { icon: <BookOpen size={16} />, label: "Mis cursos", to: "#" },
        { icon: <TrendingUp size={16} />, label: "Mi progreso", to: `/student/${studentId}/dashboard` },
        { icon: <ClipboardCheck size={16} />, label: "Evaluaciones", to: "#" },
        { icon: <Calendar size={16} />, label: "Calendario", to: "#" },
        { icon: <FileText size={16} />, label: "Recursos", to: "#" },
        { icon: <MessageSquare size={16} />, label: "Mensajes", to: "#" },
        { icon: <User size={16} />, label: "Perfil", to: "#" },
      ],
    },
  ];
}
