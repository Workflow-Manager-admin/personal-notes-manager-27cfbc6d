import React, { useState, useEffect } from "react";
import "./App.css";

// Dummy initial notes for illustration
const DUMMY_NOTES = [
  {
    id: 1,
    title: "Welcome!",
    content: "This is your first note in your minimal Notes App. Click a note to view or edit it, or create a new note.",
    createdAt: new Date(),
    updatedAt: new Date(),
    folder: "Personal",
  },
  {
    id: 2,
    title: "Minimal, Modern UI",
    content: "This app uses a modern, minimalistic light theme as specified.",
    createdAt: new Date(),
    updatedAt: new Date(),
    folder: "Work",
  },
];

// PUBLIC_INTERFACE
function App() {
  // Theme management (with default to light)
  const [theme] = useState("light");

  // Notes state
  const [notes, setNotes] = useState(() => DUMMY_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState(DUMMY_NOTES[0]?.id || null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterFolder, setFilterFolder] = useState("All");

  // Folders derived from notes for sidebar
  const folders = ["All", ...Array.from(new Set(notes.map((n) => n.folder).filter(Boolean)))];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Helper - get filtered notes by folder
  const displayedNotes = filterFolder === "All"
    ? notes
    : notes.filter((n) => n.folder === filterFolder);

  // Helper - get selected note
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  /** PUBLIC_INTERFACE
   * Create a new blank note and select for editing.
   */
  function handleNewNote() {
    const newNote = {
      id: Date.now(),
      title: "",
      content: "",
      folder: "Personal",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setEditingNoteId(newNote.id);
    setFilterFolder("All");
  }

  /** PUBLIC_INTERFACE
   * Update the selected note's fields (title/content/folder).
   */
  function handleEditNoteChange(field, value) {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              [field]: value,
              updatedAt: new Date(),
            }
          : n
      )
    );
  }

  /** PUBLIC_INTERFACE
   * Commit/save changes to a note and finish editing.
   */
  function handleSaveNote() {
    setEditingNoteId(null);
  }

  /** PUBLIC_INTERFACE
   * Delete a note by id, adjust selected note if needed.
   */
  function handleDeleteNote(id) {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setEditingNoteId(null);
    }
  }

  /** PUBLIC_INTERFACE
   * Start editing a note.
   */
  function handleEditNote(id) {
    setEditingNoteId(id);
    setSelectedNoteId(id);
  }

  /** PUBLIC_INTERFACE
   * Select a note (for viewing details)
   */
  function handleSelectNote(id) {
    setSelectedNoteId(id);
    setEditingNoteId(null);
  }

  /** PUBLIC_INTERFACE
   * Change current folder filter (sidebar)
   */
  function handleSelectFolder(folder) {
    setFilterFolder(folder);
    setSidebarOpen(false); // Optional: auto-collapse on mobile
    // Deselect all notes when switching folder for a cleaner UX
    setSelectedNoteId(null);
    setEditingNoteId(null);
  }

  return (
    <div className="notes-app-root" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Top Nav Bar */}
      <nav className="top-nav">
        <span className="nav-title">NotesApp</span>
        <button
          className="nav-btn"
          title="New Note"
          onClick={handleNewNote}
        >
          + New Note
        </button>
        <button
          className="sidebar-toggle"
          title="Toggle Sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
          style={{ marginLeft: "auto" }}
        >
          ☰
        </button>
      </nav>

      {/* Layout: Sidebar + Main Content */}
      <section className="layout-section">
        {/* Sidebar for folders/categories */}
        <aside className={`sidebar${sidebarOpen ? "" : " sidebar-closed"}`}>
          <div className="sidebar-header">Folders</div>
          {folders.map((folder) => (
            <button
              className={`sidebar-item${filterFolder === folder ? " active" : ""}`}
              key={folder}
              onClick={() => handleSelectFolder(folder)}
            >
              {folder}
            </button>
          ))}
        </aside>
        {/* Main Content */}
        <main className="main-content">
          {/* Notes List */}
          <section className="note-list-section">
            <div className="list-header">Notes {filterFolder !== "All" && `: ${filterFolder}`}</div>
            <ul className="note-list">
              {displayedNotes.length === 0 && (
                <li className="note-list-empty">No notes in this folder.</li>
              )}
              {displayedNotes.map((n) => (
                <li
                  className={`
                    note-list-item
                    ${selectedNoteId === n.id ? "selected" : ""}
                    ${editingNoteId === n.id ? "editing" : ""}
                  `}
                  key={n.id}
                  onClick={() => handleSelectNote(n.id)}
                >
                  <div>
                    <span className="item-title">
                      {n.title || <span className="item-untitled">[Untitled]</span>}
                    </span>
                    <span className="item-folder">
                      {n.folder && <span className="folder-pill">{n.folder}</span>}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className="meta-time">
                      {n.updatedAt instanceof Date
                        ? n.updatedAt.toLocaleDateString()
                        : new Date(n.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      className="item-del-btn"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(n.id);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          {/* Note Details/Editor */}
          <section className="note-details-section">
            {!selectedNote && (
              <div className="note-details-empty">
                <span>Select a note to view details or edit.</span>
              </div>
            )}
            {selectedNote && editingNoteId === selectedNote.id ? (
              <NoteEditor
                note={selectedNote}
                folders={folders.filter((f) => f !== "All")}
                onChange={handleEditNoteChange}
                onSave={handleSaveNote}
                onCancel={() => setEditingNoteId(null)}
              />
            ) : selectedNote ? (
              <NoteViewer
                note={selectedNote}
                onEdit={() => handleEditNote(selectedNote.id)}
              />
            ) : null}
          </section>
        </main>
      </section>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, folders, onChange, onSave, onCancel }) {
  // Controlled local state for form fields (for better UX)
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [folder, setFolder] = useState(note.folder);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder);
  }, [note]);

  function handleSave() {
    onChange("title", title);
    onChange("content", content);
    onChange("folder", folder);
    onSave();
  }

  return (
    <form className="note-editor" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <input
        className="note-title-input"
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
        autoFocus
      />
      <textarea
        className="note-content-input"
        placeholder="Type your note here..."
        value={content}
        onChange={e => setContent(e.target.value)}
        minRows={6}
        rows={10}
        spellCheck={true}
      />
      <div className="editor-row">
        <select
          className="note-folder-select"
          value={folder}
          onChange={e => setFolder(e.target.value)}
        >
          {folders.map((f) => (
            <option value={f} key={f}>{f}</option>
          ))}
        </select>
        <div className="editor-actions">
          <button type="submit" className="btn-primary" title="Save changes">💾 Save</button>
          <button type="button" className="btn-secondary" onClick={onCancel} title="Cancel">Cancel</button>
        </div>
      </div>
    </form>
  );
}

// PUBLIC_INTERFACE
function NoteViewer({ note, onEdit }) {
  return (
    <div className="note-viewer">
      <div className="viewer-title-row">
        <span className="note-view-title">{note.title || "[Untitled]"}</span>
        <button className="btn-edit" onClick={onEdit} title="Edit note">✏️ Edit</button>
      </div>
      <div className="note-view-content">{note.content}</div>
      {note.folder && <span className="note-folder-indicator">{note.folder}</span>}
      <div className="note-view-date">
        Last updated:{" "}
        {note.updatedAt instanceof Date
          ? note.updatedAt.toLocaleString()
          : new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}

export default App;
