import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    departmentId: string;
    departmentName: string;
    position?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      departmentId: string;
      departmentName: string;
      position?: string | null;
      email: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    departmentId: string;
    departmentName: string;
    position?: string | null;
  }
}
