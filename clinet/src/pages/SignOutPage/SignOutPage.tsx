import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { signoutThunk } from "../../entities/user/api/UserApi";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";

export default function SignOutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const signOut = async () => {
      try {
        await dispatch(signoutThunk()).unwrap();
      } catch (error) {
        console.error("Sign out error:", error);
      } finally {
        navigate(CLIENT_ROUTES.HOME);
      }
    };

    signOut();
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}
