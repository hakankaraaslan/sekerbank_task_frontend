import { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState(0);
  const navigate = useNavigate();

  const handleTransfer = async () => {
    if (!fromAccountId || !toAccountId || amount <= 0) {
      alert("Lütfen hesap ve alıcı seçin, ayrıca geçerli bir tutar girin.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/transfer", {
        fromAccountId,
        toAccountId,
        amount,
      });
      alert("Transfer başarılı!");
    } catch (error) {
      alert("Transfer başarısız!");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
        password,
      });
      localStorage.setItem("userId", response.data);
      navigate("/dashboard");
    } catch (err) {
      alert("Hatalı giriş");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" mb={3}>
          <img src="/şekerbank.png" alt="Şekerbank" style={{ height: "100px" }} />
        </Box>
        <TextField
          label="Kullanıcı Adı"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Şifre"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 2, backgroundColor: "green", "&:hover": { backgroundColor: "#006400" } }}
        >
          GİRİŞ
        </Button>
      </Container>
    </Box>
  );
}

export default LoginPage;