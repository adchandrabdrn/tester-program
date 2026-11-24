document.addEventListener('DOMContentLoaded', function () {
  // 1. Tandai menu halaman yang sedang dibuka
  var file = location.pathname.split('/').pop() || 'beranda.html';
  document.querySelectorAll('nav a').forEach(function (a) {
    if (a.getAttribute('href') === file) a.classList.add('aktif');
  });

  // 2. Tombol mode gelap/terang (pilihan diingat)
  var tema = document.createElement('button');
  tema.id = 'tema'; tema.className = 'tombol-float';
  tema.title = 'Ganti mode gelap/terang';
  function setTema(gelap) {
    document.body.classList.toggle('dark', gelap);
    tema.textContent = gelap ? '☀' : '☾';
    try { localStorage.setItem('tema', gelap ? 'gelap' : 'terang'); } catch (e) {}
  }
  var simpan = null;
  try { simpan = localStorage.getItem('tema'); } catch (e) {}
  setTema(simpan === 'gelap');
  tema.onclick = function () { setTema(!document.body.classList.contains('dark')); };
  document.body.appendChild(tema);

  // 3. Tombol kembali ke atas
  var atas = document.createElement('button');
  atas.id = 'keatas'; atas.className = 'tombol-float';
  atas.textContent = '↑'; atas.title = 'Kembali ke atas';
  atas.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  document.body.appendChild(atas);
  window.addEventListener('scroll', function () {
    atas.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  // 4. Tanggal & salam di header
  var h2 = document.querySelector('header h2');
  if (h2) {
    var jam = new Date().getHours();
    var salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 12px;font-size:.9rem;opacity:.9';
    p.textContent = salam + '! ' + new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    h2.after(p);
  }

  // 5. Formulir pemesanan: hitung total + validasi
  var form = document.getElementById('formPesan');
  if (!form) return;
  var harga = { Ori: { 4: 10000, 6: 14000 }, Keju: { 4: 12000, 6: 17000 }, Mentai: { 4: 15000, 6: 20000 } };
  var out = document.getElementById('ringkasan');
  var rp = function (n) { return 'Rp' + n.toLocaleString('id-ID'); };

  function hitung() {
    var isi = form.querySelector('[name=isi]:checked');
    var jml = parseInt(form.jumlah.value, 10);
    if (!isi || !(jml >= 1)) return 0;
    return harga[form.varian.value][isi.value] * jml;
  }
  function tampilTotal() {
    var t = hitung();
    document.getElementById('total').textContent = t ? rp(t) : '-';
  }
  form.addEventListener('input', tampilTotal);
  form.addEventListener('change', tampilTotal);
  form.addEventListener('reset', function () {
    out.textContent = ''; out.className = '';
    form.querySelectorAll('.salah').forEach(function (e) { e.classList.remove('salah'); });
    setTimeout(tampilTotal, 0);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = [];
    form.querySelectorAll('.salah').forEach(function (x) { x.classList.remove('salah'); });
    function cek(ok, el, pesan) { if (!ok) { err.push(pesan); if (el) el.classList.add('salah'); } }
    cek(form.nama.value.trim().length >= 3, form.nama, 'Nama minimal 3 huruf.');
    cek(/^(08|628)\d{7,11}$/.test(form.hp.value.trim()), form.hp, 'No. HP harus berupa angka, diawali 08 atau 628 (9-13 digit).');
    cek(form.querySelector('[name=isi]:checked'), null, 'Pilih isi 4 pcs atau 6 pcs.');
    cek(parseInt(form.jumlah.value, 10) >= 1, form.jumlah, 'Jumlah porsi minimal 1.');
    cek(form.alamat.value.trim().length >= 10, form.alamat, 'Alamat minimal 10 karakter.');

    if (err.length) {
      out.className = 'error';
      out.innerHTML = '<b>Pesanan belum bisa dikirim:</b><ul><li>' + err.join('</li><li>') + '</li></ul>';
      return;
    }
    var tambah = [];
    if (form.tambahan1.checked) tambah.push('Sambal');
    if (form.tambahan2.checked) tambah.push('Saus tambahan');
    var s = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
    out.className = '';
    out.innerHTML = '<b>Terima kasih, ' + s(form.nama.value.trim()) + '! Pesanan Anda tercatat.</b><br>' +
      'Dimsum ' + form.varian.value + ' isi ' + form.querySelector('[name=isi]:checked').value + ' pcs x ' + parseInt(form.jumlah.value, 10) + ' porsi<br>' +
      'Tambahan: ' + (tambah.join(', ') || '-') + '<br>' +
      'Diantar ke: ' + s(form.alamat.value.trim()) + '<br>' +
      'Total: <b>' + rp(hitung()) + '</b> (belum termasuk ongkos antar). Admin akan menghubungi ' + s(form.hp.value.trim()) + '.';
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
