import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function PreferenceModal({ availableFields, onClose, onSave }) {
  const [selectedFields, setSelectedFields] = useState(availableFields);

  const handleFieldToggle = (fieldName) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(fieldName)
        ? prevFields.filter((field) => field !== fieldName)
        : [...prevFields, fieldName]
    );
  };

  const handleSave = () => {
    onSave(selectedFields);
    onClose();
  };

  return (
    <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Alan Seçimi</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Hangi alanları görmek istersiniz?</p>
            {availableFields.map((fieldName, index) => (
              <div key={index} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`check_${fieldName}`}
                  checked={selectedFields.includes(fieldName)}
                  onChange={() => handleFieldToggle(fieldName)}
                />
                <label className="form-check-label" htmlFor={`check_${fieldName}`}>
                  {fieldName}
                </label>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('kullanicilar')) || []);
  const [formData, setFormData] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [file, setFile] = useState(null);
  const [availableFields, setAvailableFields] = useState(['ad', 'soyad', 'yas', 'cinsiyet', 'memleket']);
  const [showPreferencesModal, setShowPreferencesModal] = useState(true);

  useEffect(() => {
    localStorage.setItem('kullanicilar', JSON.stringify(users));
  }, [users]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = () => {
    if (editingIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingIndex] = formData;
      setUsers(updatedUsers);
      setFormData({});
      setEditingIndex(null);
    } else {
      setUsers([...users, formData]);
      setFormData({});
    }
  };

  const handleEdit = (index) => {
    setFormData(users[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('dosya', file);

      const response = await axios.post('https://mern-flipper-api.vercel.app:3001/yukle-excel', formData);
      const { data } = response;

      setUsers([...users, ...data]);
      setFile(null);
    } catch (error) {
      console.error('Excel dosyası yüklenirken hata oluştu', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://mern-flipper-api.vercel.app:3001/olustur-excel', { data: users }, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'kullanicilar.xlsx';
      link.click();
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata oluştu', error);
    }
  };

  const handlePreferencesSave = (selectedFields) => {
    setAvailableFields(selectedFields);
    setShowPreferencesModal(false);
  };

  return (
    <div className="container mt-5">
      {showPreferencesModal && (
        <PreferenceModal
          availableFields={availableFields}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handlePreferencesSave}
        />
      )}
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            {availableFields.map((fieldName, index) => (
              <div key={index} className="mb-3">
                <label htmlFor={fieldName} className="form-label">
                  {fieldName}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={fieldName}
                  name={fieldName}
                  value={formData[fieldName] || ''}
                  onChange={handleChange}
                />
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={handleAddUser}>
              {editingIndex !== null ? 'Kullanıcıyı Düzenle' : 'Kullanıcı Ekle'}
            </button>
            <button type="submit" className="btn btn-success ms-2">
              Excel Oluştur
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <input type="file" className="form-control mb-3" accept=".xls,.xlsx" onChange={handleFileChange} />
          <button type="button" className="btn btn-secondary" onClick={handleFileUpload}>
            Excel Yükle
          </button>
          <div className="mt-3">
            <h2>Kullanıcı Listesi:</h2>
            <ul className="list-group">
              {users.map((user, index) => (
                <li key={index} className="list-group-item">
                  {availableFields.map((fieldName, fieldIndex) => (
                    <span key={fieldIndex}>{user[fieldName]} </span>
                  ))}
                  <button onClick={() => handleEdit(index)} className="btn btn-warning btn-sm ms-2">
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(index)} className="btn btn-danger btn-sm ms-2">
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
