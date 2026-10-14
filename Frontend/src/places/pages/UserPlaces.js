import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { useHttpClient } from "../../shared/components/UI Elements/Hooks/http-hook";
// import { isEmpty } from "ol/extent";
import { AuthContext } from "../../shared/components/UI Elements/context/auth-context";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UI Elements/ErrorModal";
import LoadingSpinner from "../../shared/components/UI Elements/LoadingSpinner";

const UserPlaces = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState();
  const userID = useParams().userId;

  const isOwnProfile = auth.userID === userID;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userID}`,
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userID]);

  const placeDeleteHandler = (deletedPlaceID) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceID),
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList
          items={loadedPlaces}
          onDeletePlace={placeDeleteHandler}
          showEmptyState={isOwnProfile}
        />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
