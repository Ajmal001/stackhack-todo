import React, { useEffect, useState, useContext } from "react";

//Material Components
import { Button, IconButton } from "@material-ui/core";
import TodoApi from "../api/TodoApi";
import AddTodo from "./AddTodo";
import OcrDialog from "./OcrDialog/OcrDialog";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import SortIcon from "@material-ui/icons/Sort";
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from "@material-ui/styles";

//Custom Components
import TodoDialog from "./TodoDialog";
import ToDoList from "./ToDoList";
import { userContext } from "../utils/userContext";
import EmptyData from "./EmptyData";

const useStyles = makeStyles((theme) => ({
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    '& > *': {
      margin: theme.spacing(1),
    },
  }
}))

function Dashboard() {
  const user = useContext(userContext);

  const [todos, setTodos] = useState([]);
  const [isOpenDlg, setisOpenDlg] = useState(false);
  const [currentTodo, setCurrentTodo] = useState();
  const [editing, setEditing] = useState(false);
  const [openOcrDlg, setOpenOcrDlg] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [sortType, setSortType] = useState();
  const [search, setSearch] = useState(null);

  useEffect(() => {
    TodoApi.get(`/todo/getTodos/${user.email}`)
      .then((res) => {
        if (res.status === 200) {
          setTodos(res.data.todos);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

 
  const handleSortCllck = (event) => {
    setSortAnchorEl(event.currentTarget);
  } 

  const handleFilterCllck = (event) => {
    setFiltersAnchorEl(event.currentTarget);
  } 

  const hanndleMenuClose = () => {
    setSortAnchorEl(null);
    setFiltersAnchorEl(null);
  }

  const handleMenuItemclick = (sortType) => {
    hanndleMenuClose();
    setSortType(sortType);
  }

  const addTodo = (todo) => {
    TodoApi.post("/todo/addTodo", { ...todo, username: user.email })
      .then((res) => {
        if (res.status === 200) {
          setTodos([...todos, res.data.todo]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteTodo = (_id) => {
    TodoApi.post("/todo/deleteTodo", { _id })
      .then((res) => {
        if (res.status === 200) {
          setTodos(todos.filter((todo) => todo._id !== _id));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const editTodo = (todo) => {
    setEditing(true);
    setisOpenDlg(true);
    setCurrentTodo({ ...todo });
  };

  const changePriority = (_id, priority) => {
   // menuItemClick(_id);
    TodoApi.post("/todo/updatePriority", { _id, priority })
      .then((res) => {
        if (res.status === 200) {
          const todosNew = todos.map((todo) =>
            todo._id === _id ? Object.assign({}, todo, { priority }) : todo
          );
          setTodos(todosNew);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changeStatus = (_id, status) => {
    TodoApi.post("/todo/updateStatus", { _id, status })
      .then((res) => {
        if (res.status === 200) {
          if (status === 3) {
            setTodos(todos.filter((todo) => todo._id !== _id));
          } else {
            const todosNew = todos.map((todo) =>
              todo._id === _id ? Object.assign({}, todo, { status }) : todo
            );
            setTodos(todosNew);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTodo = (updatedTodo) => {
    setEditing(false);
    TodoApi.post("/todo/updateTodo", { ...updatedTodo })
      .then((res) => {
        if (res.status === 200) {
          setTodos(
            todos.map((todo) =>
              todo._id === updatedTodo._id ? updatedTodo : todo
            )
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changeCompleted = (_id, completed) => {
    console.log(completed);
    TodoApi.post("/todo/updateCompleted", { _id, completed })
      .then((res) => {
        if (res.status === 200) {
          setTodos(todos.filter((todo) => todo._id !== _id));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDialogClose = () => {
    setEditing(false);
    setisOpenDlg(false);
  };

  const searchTodo = (event) => {
    let keyword = event.target.value;
    setSearch(keyword);
  }

  useEffect(() => {
    const sortTodos = (sortType) => {
      const sortedTodos = [...todos].sort(function (a, b) {
        return b[sortType] - a[sortType];
      });
      setTodos(sortedTodos);
    };

    sortTodos(sortType);
  }, [sortType]);

  const classes = useStyles();

  return (
    <div style={{ margin: 16 }}>
      <TodoDialog
        open={isOpenDlg}
        updateTodo={updateTodo}
        isEditing={editing}
        addTodo={addTodo}
        handleDialogClose={handleDialogClose}
        todo={currentTodo}
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpenOcrDlg(true)}
      >
        Open OCR Dialog
      </Button>
      <OcrDialog open={openOcrDlg} handleDialogClose={setOpenOcrDlg} />
      <AddTodo addTodo={addTodo} />

      {/* START: Todo Controls */}

      <Card>
        <CardContent className={classes.controls}>
          {/* START: SEARCH */}
          <TextField 
            label="Search Your Todo"
            onChange={ (e) => searchTodo(e)}
            size="small"
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* END: SEARCH */}
          {/* START: SORT BUTTON */}
          <Button variant="outlined" size="medium" startIcon={<SortIcon />} onClick={handleSortCllck} >
            Sort
          </Button>
          <Menu
            id="sort-todo"
            anchorEl={sortAnchorEl}
            keepMounted
            open={Boolean(sortAnchorEl)}
            onClose={hanndleMenuClose}
            elevation={1}
          >
            <MenuItem onClick={() => { handleMenuItemclick("priority"); }}>Priority</MenuItem>
            <MenuItem onClick={() => { handleMenuItemclick("dueDate");}}>Due date</MenuItem>
            <MenuItem onClick={() => {handleMenuItemclick("status");}}>Status</MenuItem>
          </Menu>
          {/* END: SORT BUTTON */}
          {/* START: FILTERS */}
          <Button variant="outlined" size="medium" startIcon={<FilterListIcon />} onClick={handleFilterCllck} >
            Filters
          </Button>
          <Menu
            id="filter-todo"
            anchorEl={filtersAnchorEl}
            keepMounted
            open={Boolean(filtersAnchorEl)}
            onClose={hanndleMenuClose}
            elevation={1}
          >
            <MenuItem onClick={() => { handleMenuItemclick("priority"); }}>Filter 1</MenuItem>
            <MenuItem onClick={() => { handleMenuItemclick("dueDate"); }}>Filter 2</MenuItem>
            <MenuItem onClick={() => { handleMenuItemclick("status"); }}>Filter 3</MenuItem>
          </Menu>
          {/* END: FILTERS */}
        </CardContent>
      </Card>
      <br></br>
      
      {/* END: Todo COntrols */}

      {todos.length > 0 ? (
        <ToDoList
          todos={todos}
          deleteTodo={deleteTodo}
          addTodo={setisOpenDlg}
          editTodo={editTodo}
          changePriority={changePriority}
          changeCompleted={changeCompleted}
          changeStatus={changeStatus}
          search={search}
        />
      ) : (
        <EmptyData message="Create your first Todo" />
      )}
    </div>
  );
}

export default Dashboard;
