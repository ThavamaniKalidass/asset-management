import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DeskDetailsPage() {
  const { deskNumber } = useParams();
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL}/api/assets/desk/${deskNumber}`
    )
      .then((res) => res.json())
      .then((data) => setAssets(data.assets || []));
  }, [deskNumber]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Desk {deskNumber}
      </h1>

      <div className="grid gap-4 mt-6">
        {assets.map((asset: any) => (
          <div
            key={asset.id}
            className="p-4 border rounded-xl"
          >
            <h3>{asset.asset_type}</h3>
            <p>{asset.brand}</p>
            <p>{asset.model_number}</p>
            <p>{asset.serial_number}</p>

            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}