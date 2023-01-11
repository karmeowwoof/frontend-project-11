import * as yup from "yup";

export const createValidationSchema = (inputValue, state) => {
    return new Promise((resolve, reject) => {
      const schema = yup
        .string()
        .required("URL is required")
        .url('Invalid URL')
        .notOneOf(state.feeds, 'RSS уже добавлен!');
  
        schema.validate(inputValue)
        .then(() => {
          state.form.errors = {};
          state.form.valid = true;
          state.feeds.push(inputValue);
        })
        .catch((e) => {
          const [err] = e.errors;
          const data = { errorContent: err };
          state.form.errors = data;
          state.form.valid = false;
        });
    });
  };