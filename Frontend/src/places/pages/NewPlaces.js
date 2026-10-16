import React, { useContext } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import { useForm } from "../../shared/components/UI Elements/Hooks/form-hook";
import { useHttpClient } from "../../shared/components/UI Elements/Hooks/http-hook";
import { AuthContext } from "../../shared/components/UI Elements/context/auth-context";

import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/components/UI Elements/util/validators";

import Input from "../../shared/components/UI Elements/FormElements/Input";
import Button from "../../shared/components/UI Elements/FormElements/Button";
import ErrorModal from "../../shared/components/UI Elements/ErrorModal";
import LoadingSpinner from "../../shared/components/UI Elements/LoadingSpinner";
import ImageUpload from "../../shared/components/UI Elements/FormElements/ImageUpload";

import "./PlaceForm.css";

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false,
  );

  const history = useHistory();

  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      // formData.append("creator", auth.userID);
      formData.append("image", formState.inputs.image.value);
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/places",
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token,
        },
      );
      history.push("/");
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid Title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(25)]}
          errorText="Please enter a valid description (at least 25 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="textarea"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid existing address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          label="Please upload a picture of the place."
          buttonText="UPLOAD PLACE PICTURE"
          onInput={inputHandler}
          errorText="Please upload an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          Add Place
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
