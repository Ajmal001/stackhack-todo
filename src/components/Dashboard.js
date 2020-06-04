//Material Components
import { Button } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from "@material-ui/icons/AddCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import SortIcon from "@material-ui/icons/Sort";
import { makeStyles } from "@material-ui/styles";
import React, { useContext, useEffect, useState } from "react";
import TodoApi from "../api/TodoApi";
import history from "../utils/history";
import { userContext } from "../utils/userContext";
import AddTodo from "./AddTodo";
import EmptyData from "./EmptyData";
import OcrDialog from "./OcrDialog/OcrDialog";
import TodoSnackBar from "./snackbar/TodoSnackBar";
//Custom Components
import TodoDialog from "./TodoDialog";
import ToDoList from "./ToDoList";
import PageLoader from "../utils/PageLoader";
import PopoverButton from "./PopoverButton";

const useStyles = makeStyles((theme) => ({
  buttonConatainer: {
    display: "flex",
    height: 30,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  button: {
    marginRight: 8,
  },
}));

function Dashboard() {
  const user = useContext(userContext);

  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [isOpenDlg, setisOpenDlg] = useState(false);
  const [currentTodo, setCurrentTodo] = useState();
  const [editing, setEditing] = useState(false);
  const [openOcrDlg, setOpenOcrDlg] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [sortType, setSortType] = useState();

  const [filteredTodos, setFilteredTodos] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterLabel, setFilterLabel] = useState([]);
  const [filterValue, setFilterValue] = useState([]);
  const [reload, setReload] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [message,setMessage] = useState('');

  useEffect(() => {
    TodoApi.get(`/todo/getTodos/${user.email}`)
      .then((res) => {
        if (res.status === 200) {
          setIsLoading(false);
          setTodos(res.data.todos);
          setReload(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [reload]);
  const handleClose = () =>{
    setOpenSnack(false);
    setMessage('')
  }
  const handleSortCllck = (event) => {
    setSortAnchorEl(event.currentTarget);
    clearFilters();
  };

  const handleFilterCllck = (event) => {
    setFiltersAnchorEl(event.currentTarget);
  };

  const hanndleMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleMenuItemclick = (sortType) => {
    hanndleMenuClose();
    setSortType(sortType);
  };

  const addTodo = (todo) => {
    TodoApi.post("/todo/addTodo", { ...todo, username: user.email })
      .then((res) => {
        if (res.status === 200) {
          setTodos([...todos, res.data.todo]);
          setOpenSnack(true)
          setMessage("Todo Added Successfully")
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
          setOpenSnack(true)
          setMessage("Todo Deleted Successfully")
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
          setOpenSnack(true)
          setMessage("Todo Updated Successfully")
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

  useEffect(() => {
    const sortTodos = (sortType) => {
      const sortedTodos = [...todos].sort(function (a, b) {
        return sortType === "dueDate"
          ? new Date(b[sortType]).getTime() - new Date(a[sortType]).getTime()
          : b[sortType] - a[sortType];
      });
      setTodos(sortedTodos);
    };

    sortTodos(sortType);
  }, [sortType]);

  const filterMethod = (label, value) => {
    setFiltersAnchorEl(null);
    setIsFiltered(true);
    setFilterLabel(label);
    setFilterValue(value);
  };

  const clearFilters = () => {
    setFiltersAnchorEl(null);
    setIsFiltered(false);
    setFilterLabel([]);
    setFilterValue([]);
  };

  useEffect(() => {
    const filterTodos = (filterLabel, filterValue) => {
      const filteredTodos = [...todos].filter((todo) => {
        return todo[filterLabel] === filterValue;
      });
      setFilteredTodos(filteredTodos);
    };
    filterTodos(filterLabel, filterValue);
  }, [filterValue]);

  const hadleClose = () => {
    setOpenSnack(false);
    setMessage('');
  }
  const classes = useStyles();

  const DashBoardContent = () => {
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
        <OcrDialog
          open={openOcrDlg}
          setReload={setReload}
          handleDialogClose={setOpenOcrDlg}
        />
        <AddTodo addTodo={addTodo} />
  
        <div className={classes.buttonConatainer}>
          <PopoverButton handleOpen={setOpenOcrDlg}/>
          <Button
                align="end"
                variant="outlined"
                className={classes.button}
                onClick={() => {
                  setisOpenDlg(true);
                }}
                size="small"
                color="primary"
                startIcon={<AddIcon />}
              >
                Add Todo
              </Button>
          <Button
            onClick={() => {history.push('/dashboard')}}
            variant="outlined"
            size="small"
            className={classes.button}
          >
            View Archieved
          </Button>
          {/* END: SEARCH */}
          {/* START: SORT BUTTON */}
          <Button
            className={classes.button}
            variant="outlined"
            size="small"
            startIcon={<SortIcon />}
            onClick={handleSortCllck}
          >
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
            <MenuItem
              onClick={() => {
                handleMenuItemclick("priority");
              }}
            >
              Priority
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuItemclick("dueDate");
              }}
            >
              Due date
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuItemclick("status");
              }}
            >
              Status
            </MenuItem>
          </Menu>
          
          <Button
            variant={isFiltered ? "contained" : "outlined"}
            size="small"
            startIcon={<FilterListIcon />}
            onClick={handleFilterCllck}
            className={classes.button}
          >
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
            <MenuItem disabled={true}>Priority</MenuItem>
            <MenuItem
              onClick={() => {
                filterMethod("priority", 3);
              }}
            >
              High
            </MenuItem>
            <MenuItem
              onClick={() => {
                filterMethod("priority", 2);
              }}
            >
              Medium
            </MenuItem>
            <MenuItem
              onClick={() => {
                filterMethod("priority", 1);
              }}
            >
              Low
            </MenuItem>
            <MenuItem disabled={true}>Status</MenuItem>
            <MenuItem
              onClick={() => {
                filterMethod("status", 1);
              }}
            >
              New
            </MenuItem>
            <MenuItem
              onClick={() => {
                filterMethod("status", 2);
              }}
            >
              In-progress
            </MenuItem>
            <MenuItem
              onClick={() => {
                clearFilters();
              }}
            >
              Clear Filters
            </MenuItem>
          </Menu>
        </div>
        <TodoSnackBar open={openSnack} message={message} handleClose={hadleClose}/>
        {
          todos.length > 0 ? (
            <ToDoList
              todos={todos}
              deleteTodo={deleteTodo}
              addTodo={setisOpenDlg}
              editTodo={editTodo}
              changePriority={changePriority}
              changeCompleted={changeCompleted}
              changeStatus={changeStatus}
              isFiltered={isFiltered}
              filteredTodos={filteredTodos}
            />
          ) : (
            <EmptyData
              height={500}
              icon={AddIcon}
              message="Create your first Todo"
            />
          )
        }
      </div>
    );
  }

  return (    
    isLoading ? <PageLoader /> : <DashBoardContent />
  );
}

export default Dashboard;
