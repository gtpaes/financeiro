import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Dot
} from "recharts";
import api from "../services/api";
import "./dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";





function Dashboard() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [gastos, setGastos] = useState(0);
  const [receitas, setReceitas] = useState(0);
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modoDelete, setModoDelete] = useState(false);



  const meses = ["Todos","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  // Recalcula saldo, gastos e receitas
  const recalculaTotais = (movs) => {
    let totalSaldo = 0, totalGastos = 0, totalReceitas = 0;

    movs.forEach(m => {
      if (m.type === "receita") {
        totalSaldo += m.value;
        totalReceitas += m.value;
      } else {
        totalSaldo -= m.value;
        totalGastos += m.value;
      }
    });

    setSaldo(totalSaldo);
    setGastos(totalGastos);
    setReceitas(totalReceitas);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/finance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovimentacoes(res.data);
        recalculaTotais(res.data);
      } catch (err) {
        console.log("Erro ao puxar dados:", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserName(res.data.name);
    } catch (error) {
      console.log("Erro ao buscar usuário:", error);
    }
  }

  fetchUser();
}, []);

  // Prepara dados para o gráfico
  const dadosGrafico = meses.slice(1).map((mesNome, i) => {
    const movsMes = movimentacoes.filter(m => m.month === i + 1);
    const receitaMes = movsMes
      .filter(m => m.type === "receita")
      .reduce((acc, cur) => acc + cur.value, 0);
    const gastoMes = movsMes
      .filter(m => m.type === "gasto")
      .reduce((acc, cur) => acc + cur.value, 0);
    const saldoMes = receitaMes - gastoMes;
    return { mes: mesNome, receita: receitaMes, gasto: gastoMes, saldo: saldoMes };
  });

  // Filtragem avançada
  const movsFiltradas = dadosGrafico
    .filter((_, i) => filtroMes === "Todos" || meses[i+1] === filtroMes)
    .map(item => {
      if (filtroTipo === "Todos") return item;
      return { mes: item.mes, valor: filtroTipo === "receita" ? item.receita : item.gasto };
    });

  const handleAdd = async (e) => {
    e.preventDefault();
    const type = e.target.tipo.value;
    const category = e.target.descricao.value;
    const value = parseFloat(e.target.valor.value);
    const month = parseInt(e.target.mes.value);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/finance/add",
        { type, category, value, month },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const novaMov = res.data;
      const novasMovs = [...movimentacoes, novaMov];
      setMovimentacoes(novasMovs);
      recalculaTotais(novasMovs);
      e.target.reset();
    } catch (err) {
      console.log("Erro ao adicionar movimentação:", err);
      alert("Erro ao adicionar movimentação");
    }
    
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const handleDelete = async (id) => {
  if (!window.confirm("Deseja excluir essa movimentação?")) return;

  try {
    const token = localStorage.getItem("token");

    await api.delete(`/finance/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const novasMovs = movimentacoes.filter(m => m._id !== id);
    setMovimentacoes(novasMovs);
    recalculaTotais(novasMovs);
  } catch (err) {
    alert("Erro ao excluir movimentação");
  }
};

 return (
  <div className="dashboard-container">

    {/* HEADER MOBILE */}
    <header className="mobile-header">
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <h2>Financeiro</h2>

      <div className="user-info">
        Olá, <strong>{userName}</strong>
      </div>
    </header>

    {/* SIDEBAR */}
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <h2>Menu</h2>

      <ul>
        <li onClick={() => {
          setFiltroTipo("Todos");
          setFiltroMes("Todos");
          setMenuOpen(false);
        }}>
          Dashboard
        </li>

        <li onClick={() => {
          setFiltroTipo("receita");
          setFiltroMes("Todos");
          setMenuOpen(false);
        }}>
          Entradas
        </li>

        <li onClick={() => {
          setFiltroTipo("gasto");
          setFiltroMes("Todos");
          setMenuOpen(false);
        }}>
          Saídas
        </li>

        <li onClick={() => {
          alert("Relatórios ainda não implementados");
          setMenuOpen(false);
        }}>
          Relatórios
        </li>
      </ul>

      {/* LOGOUT */}
      <button
        className="sidebar-logout"
        onClick={() => {
          setMenuOpen(false);
          handleLogout();
        }}
      >
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>Sair</span>
      </button>
    </aside>

    {/* MAIN */}
    <main className="dashboard-main">

      {/* HEADER DESKTOP */}
      <header className="dashboard-header">
        <h1>Financeiro</h1>

        <div className="user-info">
          Olá, <strong>{userName}</strong>
        </div>
      </header>

      {/* CARDS */}
      <section className="cards">
        <div className="card">Saldo: R$ {saldo.toFixed(2)}</div>
        <div className="card">Gastos: R$ {gastos.toFixed(2)}</div>
        <div className="card">Receitas: R$ {receitas.toFixed(2)}</div>
      </section>

      {/* FILTROS */}
      <section className="filters">
        <label>Filtrar mês:</label>
        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
          {meses.map(mes => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>

        <label>Filtrar tipo:</label>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="receita">Receita</option>
          <option value="gasto">Gasto</option>
        </select>
      </section>

      
      <section className="add-mov-card">

  {/* HEADER */}
  <div className="add-mov-header">
    <h2>{modoDelete ? "Remover Movimentações" : "Adicionar Movimentação"}</h2>

    <button
      className={`delete-toggle ${modoDelete ? "active" : ""}`}
      onClick={() => setModoDelete(!modoDelete)}
      title="Modo excluir"
      type="button"
    >
      <FontAwesomeIcon icon={faTrashAlt} />
    </button>
  </div>

  {/* CONTEÚDO */}
  {!modoDelete ? (
    /* ===== MODO ADICIONAR ===== */
    <form onSubmit={handleAdd}>
      <select name="tipo" required>
        <option value="receita">Receita</option>
        <option value="gasto">Gasto</option>
      </select>

      <input
        type="text"
        name="descricao"
        placeholder="Descrição"
        required
      />

      <input
        type="number"
        name="valor"
        placeholder="Valor"
        step="0.01"
        required
      />

      <select name="mes" required>
        {meses.slice(1).map((mes, i) => (
          <option key={mes} value={i + 1}>
            {mes}
          </option>
        ))}
      </select>

      <button type="submit">Adicionar</button>
    </form>
  ) : (
    /* ===== MODO DELETE ===== */
    <div className="delete-list">
      {movimentacoes.length === 0 && (
        <span className="empty">Nenhuma movimentação cadastrada</span>
      )}

      {movimentacoes.map((mov) => (
        <div key={mov._id} className={`delete-item ${mov.type}`}>
          <div className="delete-info">
            <strong>{mov.category}</strong>
            <span>
              R$ {mov.value.toFixed(2)} • {meses[mov.month]}
            </span>
          </div>

          <button
            type="button"
            className="delete-btn"
            onClick={() => handleDelete(mov._id)}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      ))}
    </div>
  )}

</section>

      {/* GRÁFICO */}
      <section className="chart-card">
        <h2>Fluxo Mensal</h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={movsFiltradas}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="mes" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />

            {filtroTipo === "Todos" ? (
              <>
                <Line dataKey="receita" stroke="#00ffcc" strokeWidth={3} />
                <Line dataKey="gasto" stroke="#ff4c4c" strokeWidth={3} />
              </>
            ) : (
              <Line
                dataKey="valor"
                stroke={filtroTipo === "receita" ? "#00ffcc" : "#ff4c4c"}
                strokeWidth={3}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </section>

    </main>
  </div>
);}

export default Dashboard;