// components/UserInfo.tsx

import { User } from "@supabase/supabase-js";

interface UserInfoProps {
  user: User | null;
}

const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <div className="mt-4 text-xl text-foreground">
      {user ? (
        <>
          <p>{user.email}</p>
        </>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default UserInfo;
