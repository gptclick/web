import { useState } from "react";
// import styles from "./index.module.css";

export default function Search() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event: { preventDefault: () => void; }) {
    event.preventDefault();
    try {
      const response = await fetch("/api/getFunction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setAnimalInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
     

     
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="test"
            placeholder="test"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>
        <div className=''>{JSON.stringify(result)}</div>
    </div>
  );
}