import { signOut } from 'firebase/auth';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import auth from '../../firebase.init';
import useManager from '../../hooks/useManager';
import Loading from '../Shared/Loading';

const RequireManager = ({ children }) => {
    const [user, loading] = useAuthState(auth);
    const [manager, managerLoading] = useManager(user);
    const location = useLocation();

    if (loading || managerLoading) {
        return <Loading></Loading>
    }

    if (!user || !manager) {
        signOut(auth);
        toast.error('UnAuthorized Access')
        return <Navigate to="/login" state={{ from: location }} replace></Navigate>
    }

    return children;
};

export default RequireManager;