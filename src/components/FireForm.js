import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { initialize } from 'redux-form';

class FireForm extends Component {

  constructor(props, context){
    super();
    this.context=context;
    this.state={
      initialized: false
    }
  }

  clean(obj){
    Object.keys(obj).forEach((key) => (obj[key] === undefined) && delete obj[key]);
    return obj
  }

  getCreateValues = (values) => {
    const { handleCreateValues } = this.props;

    if(handleCreateValues!==undefined && handleCreateValues instanceof Function){
      return handleCreateValues(values);
    }

    return values;

  }

  getUpdateValues = (values, dispatch, props) => {
    const { handleUpdateValues } = this.props;

    if(handleUpdateValues!==undefined && handleUpdateValues instanceof Function){
      return handleUpdateValues(values);
    }

    return values;
  }


  handleSubmit =(values) => {
    const { path, uid, onSubmitSuccess, firebaseApp} = this.props;

    if(uid){

      const updateValues=this.getUpdateValues(this.clean(values));

      if(updateValues){
        firebaseApp.database().ref().child(`${path}${uid}`).update(updateValues).then(()=>{
          if(onSubmitSuccess && onSubmitSuccess instanceof Function){
            onSubmitSuccess(values, uid);
          }
        }, e=>{console.log(e);})
      }

    }else{

      const createValues=this.getCreateValues(this.clean(values));

      if(createValues){
        firebaseApp.database().ref().child(`${path}`).push(createValues).then((snap)=>{
          if(onSubmitSuccess && onSubmitSuccess instanceof Function){
            onSubmitSuccess(values, snap.key);
          }
        }, e=>{console.log(e);})
      }

    }

  }

  handleDelete = () => {
    const { onDelete, path, uid, firebaseApp} = this.props;

    if(uid){
      firebaseApp.database().ref().child(`${path}${uid}`).remove().then(()=>{
        if(onDelete && onDelete instanceof Function){
          onDelete();
        }
      })
    }

  }

  componentWillMount(){
    const { path, uid, name, firebaseApp, initialize} = this.props;

    if(uid){
      firebaseApp.database().ref(`${path}${uid}`).on('value',
      snapshot => {
        this.setState({initialized: true}, ()=>{
          initialize(name, snapshot.val(), true)
        })
      })
    }else{
      this.setState({initialValues: {}, initialized:true})
    }

  }

  componentWillReceiveProps = (nextProps) => {
    const {  uid, name, path, firebaseApp, initialize  } = this.props;
    const {  uid: nextUid  } = nextProps;

    if(uid && uid!==nextUid){
      firebaseApp.database().ref(`${path}${nextUid}`).on('value',
      snapshot => {
        this.setState({initialized: true}, ()=>{
          initialize(name, snapshot.val(), true)
        })
      })
    }
  }

  componentWillUnmount(){
    const { path, uid, firebaseApp} = this.props;
    firebaseApp.database().ref(`${path}${uid}`).off()
  }


  render() {

    return React.Children.only(React.cloneElement(this.props.children, {
      onSubmit: this.handleSubmit,
      ...this.state,
      ...this.props
    }))
  }
}

FireForm.propTypes = {
  path: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  firebaseApp: PropTypes.any.isRequired,
  uid: PropTypes.string,
  onSubmitSuccess: PropTypes.func,
  onDelete: PropTypes.func,
  handleCreateValues: PropTypes.func,
  handleUpdateValues: PropTypes.func,
};


const mapStateToProps = (state) => {
  return {
  };
};

export default connect(
  mapStateToProps, {initialize}
)(FireForm);
