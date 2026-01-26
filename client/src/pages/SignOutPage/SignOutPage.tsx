import { useEffect } from "react";
import { useNavigate } from "react-router";
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
    <div className="signout-page">
      <div className="spell-loader" />
      <p>Выход...</p>
    </div>
  );
}
