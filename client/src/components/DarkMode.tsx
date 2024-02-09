/* The MIT License (MIT)
 *
 * Copyright (c) 2022-present David G. Simmons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React, { useEffect } from "react";
import store from "store2";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DarkController() {
  const [dark, setDark] = React.useState<boolean>(false);

  /**
   * get the dark mode
   */
  useEffect(() => {
    const darkMode = store.get("dark");
    if (darkMode === undefined) {
      console.log("Dark not stored");
      store.set("dark", false);
      setDark(false);
    } else {
      setDark(darkMode);
    }
  }, []);
  /**
   * set the dark mode
   */
  useEffect(() => {
    store.set("dark", dark);
    if (dark) {
      window.document
        .getElementsByTagName("html")[0]
        .setAttribute("data-bs-theme", "dark");
    } else {
      window.document
        .getElementsByTagName("html")[0]
        .setAttribute("data-bs-theme", "light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  /**
   * toggle the dark mode
   */
  const toggleDark = () => {
    setDark(!dark);
  };

  return (
    <div>
      <button
        className="bi-button"
        style={{ cursor: "pointer" }}
        onClick={toggleDark}
      >
        <i className={dark ? "bi bi-sun" : "bi bi-moon-stars"}></i>
      </button>
    </div>
  );
}
