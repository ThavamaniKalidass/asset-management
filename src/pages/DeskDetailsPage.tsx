import { useParams } from "react-router-dom";

export default function DeskDetailsPage() {
  const { deskNumber } = useParams();

  return (
    <div className="p-6">
      <h1>Desk Details</h1>
      <h2>{deskNumber}</h2>
    </div>
  );
}