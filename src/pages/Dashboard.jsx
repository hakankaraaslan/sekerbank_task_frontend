import { Drawer, List, ListItem, ListItemText, Box, Typography, Modal, TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const drawerWidth = 240;

function Dashboard() {
  // Sol menüde hangi ana sekmenin seçili olduğunu tutar ("Hesaplarım" veya "Kartlarım")
  const [selected, setSelected] = useState("Hesaplarım");
  // Alt görünümde hangi sayfanın gösterileceğini tutar (örn. "Vadesiz", "Vadeli", "KayıtlıTransfer" vb.)
  const [subView, setSubView] = useState(null);
  // Kullanıcının hesaplarını tutar
    const [accounts, setAccounts] = useState([]);
  // Tutar giriş modalının açık/kapalı durumunu tutar
  const [open, setOpen] = useState(false);
  // Kullanıcının gönderim yapmak istediği hesap ID'si
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  // Para transferi yapılacak alıcı hesabın ID'si
  const [receiverId, setReceiverId] = useState("");
  // Vadesiz hesaplar için başlangıç bakiyesi ₺10.000
  const [balance, setBalance] = useState(10000);
  // Kullanıcının girdiği transfer tutarı (string, formatlı)
  const [amount, setAmount] = useState('');

  const recipientList = [
    { id: 2, name: 'Hakan', bank: 'Şekerbank T.A.Ş.', iban: 'TR19 0000 1000 2001 0000 1010 35' },
    { id: 3, name: 'Batuhan', bank: 'Şekerbank T.A.Ş.', iban: 'TR00 1000 2000 2001 0000 3030 35' },
    { id: 4, name: 'Sibel', bank: 'Şekerbank T.A.Ş.', iban: 'TR00 1000 2000 2001 0000 4040 300' }
  ];

  // selected değiştiğinde ("Hesaplarım" seçiliyse), kullanıcının hesaplarını backend'den çek
  useEffect(() => {
    if (selected === "Hesaplarım") {
      const userId = localStorage.getItem("userId");
      axios
        .get(`http://localhost:8080/accounts?userId=${userId}`)
        .then((res) => setAccounts(res.data))
        .catch((err) => console.error("Hesaplar alınamadı", err));
    }
  }, [selected]);

  // Para transferi işlemini gerçekleştiren fonksiyon
  // - Tutar kontrolü, bakiye kontrolü, backend'e transfer isteği gönderme ve UI güncellemeleri burada yapılır
  const handleTransfer = () => {
    // Kullanıcının girdiği tutarı sayıya çevir (örn. 1.000,50 → 1000.50)
    const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

    // 1) Tutar geçerli mi kontrolü
    if (!parsedAmount || parsedAmount <= 0) {
      alert("Geçerli bir tutar girin.");
      return;
    }

    // 2) Yeterli bakiye var mı kontrolü
    if (parsedAmount > balance) {
      alert("Yetersiz bakiye");
      setOpen(false); // Modalı kapat
      setSubView("Vadesiz");
      return;
    }

    // 3) Bakiye güncellemesi (frontend)
    const newBalance = balance - parsedAmount;
    setBalance(newBalance);
    setAmount('');
    const selectedRecipient = recipientList.find(r => r.id === receiverId);

    // 4) Transferi backend'e ilet
    fetch('http://localhost:8080/api/transfer/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        //fromAccountId: selectedAccountId,
        fromAccountId: 1,
        toAccountId: receiverId,
        toName: selectedRecipient ? selectedRecipient.name : '',
        
        toIban: selectedRecipient ? selectedRecipient.iban : '',

        
        amount: parsedAmount
      })
    })
    .then(response => {
      // 5) Backend işlemi başarılı mı kontrolü
      console.log('response:', response);
      if (!response.ok) {
        throw new Error('Transfer loglama başarısız');
      }
      return response.json();
    })
    .then(data => {
      // 6) İşlem başarılıysa loglama
      console.log('Log kaydı başarıyla gönderildi:', data);
    })
    .catch(error => {
      // 7) Hata durumunda loglama
      console.error('Hata:', error);
    });

    // 8) İşlem başarı mesajı ve modalı kapat
    alert("Transfer başarılı");
    setOpen(false); // Modalı kapat
    setSubView("Vadesiz");
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#006400',
          height: '80px',
          px: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1300
        }}
      >
        <img
          src="/referanslar-sekerbank-2.png"
          alt="Şekerbank Logo"
          style={{
            height: '100%',
            maxHeight: '100%',
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </Box>
      <Box sx={{ display: "flex", pt: '80px' }}>
      {/* Sol Menü (Drawer) */}
      {/* Drawer: Sol menüyü kontrol eder, kullanıcının "Hesaplarım" veya "Kartlarım" gibi ana sekmeler arasında geçiş yapmasını sağlar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          mt: '80px',
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
            marginTop: '80px'
          },
        }}
      >

 
        <List>
          {/* Sol menüde "Hesaplarım" ve "Kartlarım" seçenekleri arasında geçiş */}
          {["Hesaplarım", "Kartlarım"].map((text) => (
            <ListItem
              key={text}
              onClick={() => {
                setSelected(text);
                setSubView(null);
              }}
              sx={{
                backgroundColor: '#006400',
                color: 'white',
                m: 1,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#004d00',
                },
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <ListItemText
                primaryTypographyProps={{ fontWeight: 'bold' }}
                primary={text}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* İçerik */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Başlık ve üst bilgi */}
        <Box
          sx={{
            backgroundColor: '#f0f0f0',
            padding: 2,
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {/* Sayfanın başlığı: Alt görünüm ve ana sekmeye göre başlık değişir */}
            {subView === "KayıtlıTransfer"
              ? "Kayıtlı Alıcıya Transfer"
              : selected === "Hesaplarım" && subView === "Vadesiz"
              ? "Vadesiz Hesaplarım"
              : selected === "Hesaplarım" && subView === "Vadeli"
              ? "Vadeli Hesaplarım"
              : selected === "Kartlarım" && subView === "Kredi"
              ? "Kredi Kartlarım"
              : selected === "Kartlarım" && subView === "Banka"
              ? "Banka Kartlarım"
              : selected}
          </Typography>
        </Box>
        {/* Ana içerikte conditional render: Hangi ana sekme seçiliyse ona göre gösterim */}
        {selected === "Hesaplarım" ? (
          <Box>
            {/* Alt görünüm yoksa (ana "Hesaplarım" sayfası): Vadesiz/Vadeli butonlarını göster */}
            {subView === null && (
              <>
                <Box
                  onClick={() => setSubView("Vadesiz")}
                  sx={{ backgroundColor: '#006400', color: 'white', px: 2, py: 1, borderRadius: 1, width: 'fit-content', fontWeight: 'bold', fontSize: '1.2rem', mt: 2, cursor: 'pointer' }}
                >
                  Vadesiz Hesaplarım
                </Box>
                <Box
                  onClick={() => setSubView("Vadeli")}
                  sx={{ backgroundColor: '#006400', color: 'white', px: 2, py: 1, borderRadius: 1, width: 'fit-content', fontWeight: 'bold', fontSize: '1.2rem', mt: 4, cursor: 'pointer' }}
                >
                  Vadeli Hesaplarım
                </Box>
              </>
            )}

            {/* Vadesiz hesaplar görünümü */}
            {subView === "Vadesiz" && (
              <>
                {/* Geri dön butonu */}
                <Box
                  onClick={() => setSubView(null)}
                  sx={{
                    backgroundColor: '#b71c1c',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mb: 2,
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </Box>
                {/* Hesap özet kutusu */}
                <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6" fontWeight="bold">
                    4.LEVENT Şubesi - Vadesiz
                  </Typography>
                  <Typography variant="h6">
                    Bakiye: ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                {/* Transfer butonları */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#006400' }}
                    onClick={() => {
                      setSubView("KayıtlıTransfer");
                    }}
                  >
                    Kayıtlı Alıcıya Transfer
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#006400' }}
                    onClick={() => {
                      alert("Yeni Alıcıya Transfer sayfasına yönlendirilecek.");
                      // burada setState ile yeni view belirlenebilir
                    }}
                  >
                    YENİ Alıcıya Transfer
                  </Button>
                </Box>
                {/* Vadesiz hesapların listesi */}
                {accounts.filter(acc => acc.type === "Vadesiz").map((acc) => (
                  <Box key={acc.id} sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {acc.branch || "Şube"} - {acc.accountNumber || acc.id} - Vadesiz
                    </Typography>
                    <Typography>
                      Bakiye: <strong>{parseFloat(acc.balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
                    </Typography>
                    <Typography>
                      Kullanılabilir Bakiye: <strong>{parseFloat(acc.balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
                    </Typography>
                    {/* Para gönder butonu: Modal açılır */}
                    <Button
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: '#006400' }}
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        setOpen(true);
                      }}
                    >
                      Bu Hesaptan Para Gönder
                    </Button>
                  </Box>
                ))}
              </>
            )}

            {/* Vadeli hesaplar görünümü */}
            {subView === "Vadeli" && (
              <>
                {/* Geri dön butonu */}
                <Box
                  onClick={() => setSubView(null)}
                  sx={{
                    backgroundColor: '#b71c1c',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mb: 2,
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </Box>
                {/* Hesap özet kutusu */}
                <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6" fontWeight="bold">
                    4.LEVENT Şubesi - Vadeli
                  </Typography>
                  <Typography variant="h6">
                    Bakiye: ₺5.000.000,00
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                    (Vadeli hesap işlemleri sadece şubelerimizden yapılabilir.)
                  </Typography>
                </Box>
                {/* Vadeli hesapların listesi */}
                {accounts.filter(acc => acc.type === "Vadeli").map((acc) => (
                  <Box key={acc.id} sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {acc.branch || "Şube"} - {acc.accountNumber || acc.id} - Vadeli
                    </Typography>
                    <Typography>
                      Bakiye: <strong>{parseFloat(acc.balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
                    </Typography>
                    <Typography>
                      Kullanılabilir Bakiye: <strong>{parseFloat(acc.balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
                    </Typography>
                    {/* Para gönder butonu: Modal açılır */}
                    <Button
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: '#006400' }}
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        setOpen(true);
                      }}
                    >
                      Bu Hesaptan Para Gönder
                    </Button>
                  </Box>
                ))}
              </>
            )}
            {/* Kayıtlı alıcıya transfer görünümü */}
            {subView === "KayıtlıTransfer" && (
              <>
                {/* Geri dön butonu */}
                <Box
                  onClick={() => setSubView("Vadesiz")}
                  sx={{
                    backgroundColor: '#b71c1c',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mb: 2,
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </Box>
                {/* Kayıtlı alıcılar başlığı */}
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Kayıtlı Alıcılar
                </Typography>
                {/* Kayıtlı alıcı: Hakan */}
                
                
               
                {/* Kayıtlı alıcı: Sibel */}
                {recipientList.map((recipient) => (
                  <Box
                    key={recipient.id}
                    sx={{
                      p: 2,
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      backgroundColor: '#006400',
                      color: 'white',
                      mb: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setReceiverId(recipient.id); // keep respective receiverId
                      setOpen(true);
                    }}
                  >
                    <Typography fontWeight="bold">{recipient.name}</Typography>
                    <Typography>{recipient.bank}</Typography>
                    <Typography>{recipient.iban}</Typography>
                  </Box>
                ))}

                
                
              </>
            )}
          </Box>
        ) : (
          // "Kartlarım" ana sekmesi seçiliyse
          <Box>
            {/* Alt görünüm yoksa: Kredi ve Banka kartı butonları */}
            {subView === null && (
              <>
                <Box
                  onClick={() => setSubView("Kredi")}
                  sx={{ backgroundColor: '#006400', color: 'white', px: 2, py: 1, borderRadius: 1, width: 'fit-content', fontWeight: 'bold', fontSize: '1.2rem', mt: 2, cursor: 'pointer' }}
                >
                  Kredi Kartlarım
                </Box>
                <Box
                  onClick={() => setSubView("Banka")}
                  sx={{ backgroundColor: '#006400', color: 'white', px: 2, py: 1, borderRadius: 1, width: 'fit-content', fontWeight: 'bold', fontSize: '1.2rem', mt: 4, cursor: 'pointer' }}
                >
                  Banka Kartlarım
                </Box>
              </>
            )}

            {/* Kredi kartları görünümü */}
            {subView === "Kredi" && (
              <>
                <Box
                  onClick={() => setSubView(null)}
                  sx={{
                    backgroundColor: '#b71c1c',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mb: 2,
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 2,
                    mt: 2,
                    width: 'fit-content',
                  }}
                >
                  <img
                    src="/kart2.png"
                    alt="Kredi Kartı"
                    style={{
                      height: '80px',
                      width: 'auto',
                      marginRight: '16px',
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      KREDİ KARTI
                    </Typography>
                    <Typography>Kart no: 3040 **** **** 1020</Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Banka kartları görünümü */}
            {subView === "Banka" && (
              <>
                <Box
                  onClick={() => setSubView(null)}
                  sx={{
                    backgroundColor: '#b71c1c',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mb: 2,
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 2,
                    mt: 2,
                    width: 'fit-content',
                  }}
                >
                  <img
                    src="/kart.png"
                    alt="Bankkart"
                    style={{
                      height: '80px',
                      width: 'auto',
                      marginRight: '16px',
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      BANKKART
                    </Typography>
                    <Typography>Kart no: 1020 **** **** 3040</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}

      </Box>
    </Box>
      {/* Modal: Kullanıcıdan tutar girişi alınan popup */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 300
        }}>
          <Typography variant="h6" fontWeight="bold">Tutar Giriniz</Typography>
          {/* Seçili hesaba ait mevcut bakiye gösterimi */}
          {selectedAccountId && (
            <Typography>
              Mevcut Bakiye:{" "}
              <strong>
                {parseFloat(accounts.find(acc => acc.id === selectedAccountId)?.balance || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY'
                })}
              </strong>
            </Typography>
          )}
          {/* Kullanıcıdan para transfer tutarı alınan input */}
          <TextField
            label="Tutar (₺)"
            value={amount === "0" ? "" : amount}
            onChange={(e) => {
              let raw = e.target.value;

              // Sadece rakam ve virgül karakterlerini al
              raw = raw.replace(/[^\d,]/g, '');

              // Tam sayı ve ondalık kısmı ayır
              const parts = raw.split(',');
              if (parts.length > 2) return;

              let integer = parts[0].replace(/^0+(?!$)/, '') || '0';

              // Binlik ayıracı (nokta) ekle
              integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

              let fraction = parts[1] || '';
              if (fraction.length > 2) fraction = fraction.slice(0, 2);

              const formatted = fraction.length > 0 ? `${integer},${fraction}` : integer;
              setAmount(formatted);
            }}
            inputProps={{ inputMode: 'decimal' }}
            fullWidth
          />
          {/* Gönder butonu: handleTransfer fonksiyonunu tetikler */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#006400' }}
            onClick={handleTransfer}
          >
            Gönder
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default Dashboard;