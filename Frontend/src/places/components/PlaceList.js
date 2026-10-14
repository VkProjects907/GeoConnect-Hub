import React from "react";
// import { Link } from "react-router-dom/cjs/react-router-dom.min";

import Card from "../../shared/components/UI Elements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/UI Elements/FormElements/Button";

import "./PlaceList.css";

const PlaceList = (props) => {
  if (props.items.length === 0) {
    if (props.showEmptyState) {
      return (
        <div className="place-list center">
          <Card>
            <h2>No places found. You must create one. </h2>
            <Button to="/places/new">Share New Place</Button>
          </Card>
        </div>
      );
    }
  }
  return (
    <ul className="place-list">
      {props.items.map((place) => (
        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
